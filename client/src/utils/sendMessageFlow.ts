import { QueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { ReplyState } from "../hooks/useReply";
import { sendMessage } from "../services/message.service";
import { UserProfile } from "../types/base.types";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import {
  AttachmentCache,
  AttachmentModel,
  PendingMessageModel,
  SendMessageRequest,
} from "../types/message.types";
import { getToday } from "./datetime";
import delay from "./delay";
import {
  buildFailedRecord,
  getPersistedFailed,
  persistFailed,
  rememberSessionParam,
  removeFailed,
} from "./failedMessageStore";
import { appendMessage, confirmMessage, updateMessageById } from "./messageCache";
import { uploadFile } from "./uploadFile";

// Quá hạn này mà server chưa phản hồi → abort + đánh dấu tin failed (không pending vô hạn).
export const SEND_REQUEST_TIMEOUT_MS = 5_000;

type SendDeps = {
  queryClient: QueryClient;
  conversationId: string;
  info?: UserProfile;
  clearReply?: () => void;
};

/**
 * Luồng gửi tin nhắn dùng chung cho GỬI MỚI và GỬI LẠI (retry).
 *
 * - Gửi mới (`existingId` undefined): tạo pending message mới + optimistic preview.
 * - Gửi lại (`existingId` set): KHÔNG tạo tin mới, chỉ đưa đúng tin lỗi đó về trạng thái
 *   pending rồi thực hiện lại upload/gửi với đúng nội dung, tệp và reply ban đầu.
 *
 * Idempotency: một tin luôn chiếm đúng một vị trí (theo id). Gửi lại KHÔNG nhân đôi tin.
 */
export const sendMessageFlow = async (
  deps: SendDeps,
  param: SendMessageRequest,
  reply: ReplyState,
  existingId?: string,
) => {
  const { queryClient, conversationId, info, clearReply } = deps;
  const randomId = existingId ?? Math.random().toString(36).substring(2, 7);
  const hasMedia = (param.files ?? []).length !== 0;
  // Giữ nguyên createdTime của tin khi gửi lại (đã persist trước đó) để không đổi vị trí.
  const createdTime =
    (existingId
      ? getPersistedFailed(conversationId).find((r) => r.id === existingId)
          ?.createdTime
      : undefined) ?? dayjs().format();

  // Giữ param (kèm File) trong RAM để gửi lại đầy đủ trong phiên hiện tại.
  rememberSessionParam(conversationId, randomId, param, reply);

  // Đánh dấu 1 tin pending là gửi lỗi + persist để không mất khi tải lại trang.
  const markMessageFailed = (id: string) => {
    updateMessageById(queryClient, conversationId, id, (msg) => ({
      ...msg,
      pending: false,
      failed: true,
    }));
    persistFailed(
      conversationId,
      buildFailedRecord(id, param, reply, createdTime),
    );
  };

  if (existingId) {
    // RETRY: đưa đúng tin lỗi về trạng thái đang gửi (không append tin mới, không đổi vị trí).
    updateMessageById(queryClient, conversationId, existingId, (msg) => ({
      ...msg,
      pending: true,
      failed: false,
    }));
  } else {
    // Optimistic update: cập nhật preview lastMessage ngay lập tức
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updated = (oldData.conversations ?? []).map((conv) => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          // Text message → dùng nội dung; media-only → dùng tên file
          lastMessage:
            param.type === "text"
              ? param.content
              : (param.files ?? []).map((f) => f.name).join(","),
          lastMessageTime: dayjs().format(),
          hasAttachment: hasMedia,
        } as ConversationModel;
      });
      return {
        ...oldData,
        conversations: updated,
        filterConversations: updated,
      } as ConversationCache;
    });

    const pendingMessage: PendingMessageModel = {
      id: randomId,
      type: param.type,
      content: param.content,
      contactId: info?.id,
      // Chỉ gán attachments vào pending nếu thực sự có file (tránh array rỗng gây re-render thừa)
      attachments: hasMedia
        ? (param.attachments ?? []).map((a) => ({ ...a, id: randomId }))
        : [],
      pending: true,
      likeCount: 0,
      loveCount: 0,
      careCount: 0,
      wowCount: 0,
      sadCount: 0,
      angryCount: 0,
      currentReaction: null,
      createdTime,
      // Merge reply metadata nếu đang trong reply mode
      ...((reply as object) ?? {}),
    };

    // Thêm tin nhắn pending vào cuối danh sách (hiển thị ngay cho user)
    appendMessage(queryClient, conversationId, pendingMessage);
  }

  // Offline → fail NGAY, không gọi API (tránh request treo rồi tự gửi khi online lại).
  if (!navigator.onLine) {
    markMessageFailed(randomId);
    toast.error("Không có kết nối mạng");
    return;
  }

  let bodyToCreate: SendMessageRequest = {
    type: param.type,
    content: param.content,
    // Chỉ gửi mentions khi có (tránh body thừa với tin không tag).
    ...(param.mentions?.length ? { mentions: param.mentions } : {}),
    ...((reply as object) ?? {}),
  };

  if (hasMedia) {
    const today = getToday("MM/DD/YYYY");
    const pendingAttachments = (param.attachments ?? []).map((a) => ({
      ...a,
      id: randomId,
    }));

    // Optimistic update attachment cache trước khi upload xong (chỉ khi gửi mới —
    // retry thì attachment cache đã có sẵn bản pending từ lần gửi đầu).
    if (!existingId) {
      queryClient.setQueryData(
        ["attachment", conversationId],
        (oldData: AttachmentCache) => {
          if (!oldData?.attachments) {
            return {
              ...oldData,
              attachments: [{ date: today, attachments: pendingAttachments }],
            } as AttachmentCache;
          }
          const existing = oldData.attachments.find((a) => a.date === today);
          if (!existing) {
            return {
              ...oldData,
              attachments: [
                ...oldData.attachments,
                { date: today, attachments: pendingAttachments },
              ],
            } as AttachmentCache;
          }
          return {
            ...oldData,
            attachments: oldData.attachments.map((a) =>
              a.date === today
                ? {
                    ...a,
                    attachments: [...pendingAttachments, ...a.attachments],
                  }
                : a,
            ),
          } as AttachmentCache;
        },
      );
    }

    // Upload thực tế lên server sau khi đã show pending
    try {
      const uploaded: AttachmentModel[] = await uploadFile(param.files ?? []);
      bodyToCreate = { ...bodyToCreate, attachments: uploaded };
    } catch (err) {
      console.error("uploadFile failed", err);
      markMessageFailed(randomId);
      toast.error("Không thể tải tệp đính kèm");
      return;
    }
  }

  let res: Awaited<ReturnType<typeof sendMessage>> | undefined;
  try {
    res = await sendMessage(conversationId, bodyToCreate, SEND_REQUEST_TIMEOUT_MS);
  } catch (err) {
    console.error("sendMessage failed", err);
  }
  // API thất bại → đánh dấu failed (không kẹt pending vô hạn) + báo lỗi
  if (!res) {
    markMessageFailed(randomId);
    toast.error("Không thể gửi tin nhắn");
    return;
  }

  // Delay nhỏ để tránh flickering khi chuyển trạng thái pending → confirmed
  await delay(500);

  clearReply?.();

  // Gửi thành công → gỡ khỏi store tin lỗi (cả RAM lẫn persist).
  removeFailed(conversationId, randomId);

  // Confirm tin nhắn: thay randomId bằng messageId thật, xóa pending flag.
  confirmMessage(
    queryClient,
    conversationId,
    randomId,
    res.messageId ?? "",
    (msg) => ({
      ...msg,
      id: res!.messageId,
      loaded: true,
      pending: false,
      failed: false,
      attachments: (msg.attachments ?? []).map((atta, i) => {
        if (atta.id !== randomId) return atta;
        return {
          ...atta,
          id: (res!.attachments ?? [])[i],
          pending: false,
        };
      }),
    }),
  );

  if (hasMedia) {
    // Confirm attachment cache: thay pending id bằng id thật từ server
    queryClient.setQueryData(
      ["attachment", conversationId],
      (oldData: AttachmentCache) => ({
        ...oldData,
        attachments: oldData.attachments.map((item) =>
          item.date === getToday("MM/DD/YYYY")
            ? {
                ...item,
                attachments: item.attachments.map((atta, i) => {
                  if (atta.id !== randomId) return atta;
                  return {
                    ...atta,
                    id: (res!.attachments ?? [])[i],
                    pending: false,
                  };
                }),
              }
            : item,
        ),
      }),
    );
  }
};
