import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AttachmentCache, AttachmentModel, PendingMessageModel } from "../types/message.types";
import { getToday } from "./datetime";

export type DirectMessagePayload = {
  type: string;
  content?: string | null;
  attachments?: AttachmentModel[];
  isForwarded?: boolean;
};

export const buildMessageEntry = (
  id: string,
  payload: DirectMessagePayload,
  contactId?: string,
  pending = true,
): PendingMessageModel => ({
  id,
  type: payload.type,
  content: payload.content,
  contactId,
  attachments: payload.attachments ?? [],
  pending,
  // Khởi tạo tất cả reaction counts bằng 0 (reaction đến qua event riêng)
  likeCount: 0,
  loveCount: 0,
  careCount: 0,
  wowCount: 0,
  sadCount: 0,
  angryCount: 0,
  currentReaction: null,
  createdTime: dayjs().format(),
  isForwarded: payload.isForwarded ?? false,
});

// Tạo preview text cho lastMessage trên conversation list
export const getLastMessageText = (payload: DirectMessagePayload): string =>
  payload.attachments?.length && !payload.content
    // Media-only: hiển thị tên file thay vì nội dung text
    ? (payload.attachments ?? []).map((a) => a.mediaName).join(",")
    : payload.content ?? "";

export const upsertAttachmentCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  pendingId: string,
  attachments: AttachmentModel[],
) => {
  const today = getToday("MM/DD/YYYY");
  // Gán pendingId để sau này có thể replace bằng id thật khi server confirm
  const pending = attachments.map((a) => ({ ...a, id: pendingId }));

  queryClient.setQueryData(
    ["attachment", conversationId],
    (old: AttachmentCache) => {
      if (!old?.attachments) {
        // Cache attachment chưa tồn tại → khởi tạo với bucket hôm nay
        return {
          ...old,
          attachments: [{ date: today, attachments: pending }],
        } as AttachmentCache;
      }
      const existing = old.attachments.find((a) => a.date === today);
      if (!existing) {
        // Đã có cache nhưng chưa có bucket ngày hôm nay → thêm bucket mới
        return {
          ...old,
          attachments: [...old.attachments, { date: today, attachments: pending }],
        } as AttachmentCache;
      }
      // Bucket hôm nay đã có → prepend để ảnh mới hiển thị trước trong gallery
      return {
        ...old,
        attachments: old.attachments.map((a) =>
          a.date === today ? { ...a, attachments: [...pending, ...a.attachments] } : a,
        ),
      } as AttachmentCache;
    },
  );
};
