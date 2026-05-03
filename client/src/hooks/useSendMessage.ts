import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { sendMessage } from "../services/message.service";
import {
  AttachmentCache,
  AttachmentModel,
  MessageCache,
  PendingMessageModel,
  SendMessageRequest,
} from "../types/message.types";
import { ConversationCache, ConversationModel } from "../types/conv.types";
import { getToday } from "../utils/datetime";
import delay from "../utils/delay";
import { uploadFile } from "../utils/uploadFile";
import useConversation from "./useConversation";
import useInfo from "./useInfo";
import { useReply } from "./useReply";

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { reply, clearReply } = useReply();

  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const { mutate } = useMutation({
    mutationFn: async (param: SendMessageRequest) => {
      const randomId = Math.random().toString(36).substring(2, 7);
      const hasMedia = (param.files ?? []).length !== 0;

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
      queryClient.setQueryData(
        ["message", conversationId],
        (oldData: MessageCache) => ({
          ...oldData,
          messages: [...(oldData.messages || []), pendingMessage],
        }),
      );

      let bodyToCreate: SendMessageRequest = {
        type: param.type,
        content: param.content,
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
                  ? { ...a, attachments: [...pendingAttachments, ...a.attachments] }
                  : a,
              ),
            } as AttachmentCache;
          },
        );

        // Upload thực tế lên server sau khi đã show pending
        const uploaded: AttachmentModel[] = await uploadFile(param.files ?? []);
        bodyToCreate = { ...bodyToCreate, attachments: uploaded };
      }

      const res = await sendMessage(conversation?.id ?? "", bodyToCreate);
      // API thất bại → dừng, tin nhắn giữ trạng thái pending
      if (!res) return;

      // Delay nhỏ để tránh flickering khi chuyển trạng thái pending → confirmed
      await delay(500);

      clearReply();

      // Confirm tin nhắn: thay randomId bằng messageId thật, xóa pending flag
      queryClient.setQueryData(
        ["message", conversationId],
        (oldData: MessageCache) => ({
          ...oldData,
          messages: oldData.messages.map((msg) => {
            if (msg.id !== randomId) return msg;
            return {
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
