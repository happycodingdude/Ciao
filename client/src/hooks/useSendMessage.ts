import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { sendMessage } from "../services/message.service";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import {
  AttachmentCache,
  AttachmentModel,
  PendingMessageModel,
  SendMessageRequest,
} from "../types/message.types";
import { getToday } from "../utils/datetime";
import delay from "../utils/delay";
import { appendMessage, updateMessageById } from "../utils/messageCache";
import { uploadFile } from "../utils/uploadFile";
import useInfo from "./useInfo";
import { useReply } from "./useReply";

// Quá hạn này mà server chưa phản hồi → abort + đánh dấu tin failed (không pending vô hạn).
const SEND_REQUEST_TIMEOUT_MS = 5_000;

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { reply, clearReply } = useReply();

  const { mutate } = useMutation({
    mutationFn: async (param: SendMessageRequest) => {
      const randomId = Math.random().toString(36).substring(2, 7);
      const hasMedia = (param.files ?? []).length !== 0;

      // Đánh dấu 1 tin pending là gửi lỗi (dùng khi upload/send thất bại).
      const markMessageFailed = (id: string) =>
        updateMessageById(queryClient, conversationId, id, (msg) => ({
          ...msg,
          pending: false,
          failed: true,
        }));

      // Optimistic update: cập nhật preview lastMessage ngay lập tức
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
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
        },
      );

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
        createdTime: dayjs().format(),
        // Merge reply metadata nếu đang trong reply mode
        ...((reply as object) ?? {}),
      };

      // Thêm tin nhắn pending vào cuối danh sách (hiển thị ngay cho user)
      appendMessage(queryClient, conversationId, pendingMessage);

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

        // Optimistic update attachment cache trước khi upload xong
        queryClient.setQueryData(
          ["attachment", conversationId],
          (oldData: AttachmentCache) => {
            if (!oldData?.attachments) {
              // Attachment cache chưa khởi tạo → tạo mới với bucket hôm nay
              return {
                ...oldData,
                attachments: [{ date: today, attachments: pendingAttachments }],
              } as AttachmentCache;
            }
            const existing = oldData.attachments.find((a) => a.date === today);
            if (!existing) {
              // Chưa có bucket cho ngày hôm nay → thêm bucket mới
              return {
                ...oldData,
                attachments: [
                  ...oldData.attachments,
                  { date: today, attachments: pendingAttachments },
                ],
              } as AttachmentCache;
            }
            // Bucket hôm nay đã có → prepend vào đầu để hiển thị mới nhất trước
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

        // Upload thực tế lên server sau khi đã show pending
        try {
          const uploaded: AttachmentModel[] = await uploadFile(
            param.files ?? [],
          );
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
        res = await sendMessage(
          // Dùng thẳng conversationId (route param) — nhất quán với cache append ở trên;
          // tránh gửi tới "" khi conversation chưa nằm trong list cache (race tạo mới).
          conversationId,
          bodyToCreate,
          SEND_REQUEST_TIMEOUT_MS,
        );
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

      clearReply();

      // Confirm tin nhắn: thay randomId bằng messageId thật, xóa pending flag
      updateMessageById(queryClient, conversationId, randomId, (msg) => ({
        ...msg,
        id: res.messageId,
        loaded: true,
        pending: false,
        // Cập nhật id từng attachment theo thứ tự server trả về
        attachments: (msg.attachments ?? []).map((atta, i) => {
          if (atta.id !== randomId) return atta;
          return {
            ...atta,
            id: (res.attachments ?? [])[i],
            pending: false,
          };
        }),
      }));

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
                      // Chỉ update attachment thuộc về tin nhắn vừa gửi
                      if (atta.id !== randomId) return atta;
                      return {
                        ...atta,
                        id: (res.attachments ?? [])[i],
                        pending: false,
                      };
                    }),
                  }
                : item,
            ),
          }),
        );
      }
    },
  });

  return mutate;
};
