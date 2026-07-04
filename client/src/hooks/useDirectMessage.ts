import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { createDirectChatWithMessage } from "../services/friend.service";
import { getAttachments, getMessages, sendMessage } from "../services/message.service";
import { AttachmentCache, SendMessageRequest } from "../types/message.types";
import {
  appendMessage,
  confirmMessage,
  makeInfinite,
  readMessageData,
  updateMessageById,
  writeMessageData,
} from "../utils/messageCache";
import { ConversationCache } from "../types/conv.types";
import { ContactModel } from "../types/friend.types";
import {
  buildOptimisticConversation,
  findDirectConversation,
  optimisticId,
  prependConversation,
  reopenMember,
} from "../utils/conversationCache";
import {
  buildMessageEntry,
  DirectMessagePayload,
  getLastMessageText,
  upsertAttachmentCache,
} from "../utils/directMessageHelpers";
import { getToday } from "../utils/datetime";
import useConversation from "./useConversation";
import useInfo from "./useInfo";
import { SEND_REQUEST_TIMEOUT_MS } from "./useSendMessage";

export type { DirectMessagePayload };

type SendToContactOptions = {
  /** Pre-fetch messages & attachments before updating cache (needed when navigating to the conversation). */
  prefetch?: boolean;
  /** Called right before the API send, receives the resolved conversationId. */
  onNavigate?: (conversationId: string) => void;
};

export const useDirectMessage = () => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const sendToContact = async (
    contact: ContactModel,
    payload: DirectMessagePayload,
    options: SendToContactOptions = {},
  ) => {
    const { prefetch = false, onNavigate } = options;
    const hasMedia = !!(payload.attachments?.length);

    // CHỈ tra hội thoại trực tiếp trong danh sách ĐÃ TẢI — KHÔNG quét thêm trang.
    // Luồng gửi luôn đẩy hội thoại lên ĐẦU (không cần giữ vị trí như nút Message),
    // nên nếu không thấy trong list đã tải thì gọi thẳng createDirectChatWithMessage
    // (lookup-or-create KÈM tin nhắn) ở nhánh else: 1 request lo cả 2 case mới/cũ,
    // khỏi lookup id riêng và khỏi load-more (giảm tối đa số request).
    const existedConversation = findDirectConversation(
      conversations?.conversations ?? [],
      contact.id ?? "",
    );

    if (existedConversation) {
      // --- Luồng: cuộc hội thoại đã tồn tại ---
      const convId = existedConversation.id ?? "";

      if (prefetch) {
        // Prefetch khi cần navigate ngay lập tức: đảm bảo cache có data trước khi render
        const hasMsgs = readMessageData(queryClient, convId);
        const hasAtts = queryClient.getQueryData<AttachmentCache>(["attachment", convId]);
        if (!hasMsgs || !hasAtts) {
          const [msgs, atts] = await Promise.all([getMessages(convId, 1), getAttachments(convId)]);
          // Chỉ set vào cache nếu chưa có để tránh ghi đè data mới hơn
          if (!hasMsgs) writeMessageData(queryClient, convId, makeInfinite(msgs));
          if (!hasAtts) queryClient.setQueryData(["attachment", convId], atts);
        }
      }

      const updatedConv = {
        ...existedConversation,
        lastMessage: getLastMessageText(payload),
        lastMessageTime: dayjs().format(),
        // Nếu user đã rời group/xóa conversation → đánh dấu active lại
        members: reopenMember(existedConversation.members ?? [], info?.id ?? ""),
      };

      // Có tin nhắn mới → đẩy hội thoại lên ĐẦU danh sách (khác nút Message chỉ
      // mở xem thì giữ nguyên vị trí). prependConversation tự loại entry cũ theo id.
      queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
        prependConversation(old, updatedConv),
      );

      const randomId = optimisticId();
      // Optimistic update: thêm tin nhắn pending ngay lập tức vào cache
      appendMessage(queryClient, convId, buildMessageEntry(randomId, payload, info?.id));

      // Optimistic update attachment nếu có file đính kèm
      if (hasMedia) upsertAttachmentCache(queryClient, convId, randomId, payload.attachments!);

      onNavigate?.(convId);

      const body: SendMessageRequest = {
        type: payload.type,
        content: payload.content ?? "",
        attachments: payload.attachments,
        isForwarded: payload.isForwarded,
      };

      // Timeout + try/catch như useSendMessage: HttpRequest THROW khi lỗi, không catch
      // thì exception xuyên lên và tin kẹt pending (mờ) vĩnh viễn, lỗi im lặng.
      let res: Awaited<ReturnType<typeof sendMessage>> | undefined;
      try {
        res = await sendMessage(convId, body, SEND_REQUEST_TIMEOUT_MS);
      } catch (err) {
        console.error("sendToContact: sendMessage failed", err);
      }
      if (!res) {
        // Đánh dấu failed thay vì để pending vô hạn + báo lỗi cho user
        updateMessageById(queryClient, convId, randomId, (m) => ({
          ...m,
          pending: false,
          failed: true,
        }));
        toast.error("Không thể gửi tin nhắn");
        return;
      }

      // Replace pending id bằng id thật từ server. confirmMessage chống trùng nếu
      // FCM own-message đã kịp append bản realId trước khi API confirm về.
      confirmMessage(queryClient, convId, randomId, res.messageId ?? "", (m) => ({
        ...m,
        id: res!.messageId,
        pending: false,
      }));
    } else {
      // --- Luồng: KHÔNG thấy hội thoại trong các trang danh sách đã load ---
      // Hội thoại vẫn có thể đã tồn tại ở trang chưa tải (danh sách chat phân trang).
      // Server lookup-or-create và trả về id THẬT + cờ isNewConversation, nên phải
      // await để navigate bằng id thật — cách cũ navigate bằng tempId rồi thay id
      // trong cache khiến URL giữ tempId vĩnh viễn → Chatbox không tìm thấy hội thoại.
      let res: Awaited<ReturnType<typeof createDirectChatWithMessage>> | undefined;
      try {
        res = await createDirectChatWithMessage(contact.id ?? "", {
          message: payload.content ?? undefined,
          isForwarded: payload.isForwarded ?? false,
        });
      } catch (err) {
        console.error("sendToContact: createDirectChatWithMessage failed", err);
      }
      if (!res?.conversationId) {
        toast.error("Không thể gửi tin nhắn");
        return;
      }
      const convId = res.conversationId;
      const isNew = res.isNewConversation ?? true;

      // Prepend entry vào danh sách theo id thật. Chỉ prepend khi chưa có để không
      // clobber entry đầy đủ data (nếu FCM/new-conversation handler vừa chèn xong).
      queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
        if ((old?.conversations ?? []).some((c) => c.id === convId)) return old;
        return prependConversation(
          old ?? { conversations: [], filterConversations: [] },
          buildOptimisticConversation(convId, info!, contact, {
            lastMessage: getLastMessageText(payload),
            lastMessageTime: dayjs().format(),
          }),
        );
      });

      if (isNew) {
        // Hội thoại mới thật sự → khởi tạo message cache chỉ gồm tin vừa gửi
        writeMessageData(
          queryClient,
          convId,
          makeInfinite({
            conversationId: convId,
            hasMore: false,
            messages: [buildMessageEntry(res.messageId ?? optimisticId(), payload, info?.id, false)],
          }),
        );

        // Hội thoại MỚI HOÀN TOÀN → chưa thể có attachment nào ngoài (nếu có) file vừa
        // gửi. Seed attachment cache LUÔN, kể cả text-only (mảng rỗng), để useAttachment
        // thấy cache fresh và KHÔNG gọi thừa GET /attachment khi navigate vào hội thoại.
        queryClient.setQueryData<AttachmentCache>(["attachment", convId], {
          conversationId: convId,
          attachments: hasMedia
            ? [{ date: getToday("MM/DD/YYYY"), attachments: payload.attachments ?? [] }]
            : [],
        });
      } else {
        // Hội thoại CŨ chưa được load → KHÔNG ghi đè message cache bằng 1 tin đơn lẻ
        // (sẽ mất toàn bộ history và hasMore=false chặn luôn phân trang tin nhắn).
        if (!readMessageData(queryClient, convId) && prefetch) {
          // Sắp navigate vào → seed history thật từ server trước để không loading trắng
          const [msgs, atts] = await Promise.all([getMessages(convId, 1), getAttachments(convId)]);
          writeMessageData(queryClient, convId, makeInfinite(msgs));
          if (!queryClient.getQueryData<AttachmentCache>(["attachment", convId]))
            queryClient.setQueryData(["attachment", convId], atts);
        }
        // Tin vừa gửi được persist bất đồng bộ (Kafka) nên page 1 vừa fetch có thể
        // chưa chứa nó → append theo id thật; appendToInfinite tự dedup nếu đã có.
        if (readMessageData(queryClient, convId) && res.messageId) {
          appendMessage(queryClient, convId, buildMessageEntry(res.messageId, payload, info?.id, false));
          if (hasMedia) upsertAttachmentCache(queryClient, convId, res.messageId, payload.attachments!);
        }
      }

      onNavigate?.(convId);
    }
  };

  return { sendToContact };
};
