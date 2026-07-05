import dayjs from "dayjs";
import { ConversationModel_Member } from "../types/conv.types";
import { PendingMessageModel } from "../types/message.types";

/** Tin text có thể sửa (backend chỉ accept type text). */
export const isEditableTextMessage = (message: PendingMessageModel) => {
  if ((message.attachments?.length ?? 0) > 0) return false;
  // Backend chỉ accept edit cho tin text. Các loại có Content không phải văn bản
  // (sticker = id, poll = câu hỏi, contact = tên) KHÔNG được sửa nội dung.
  return message.type === "text";
};

export const canEditMessage = (
  message: PendingMessageModel,
  mine: boolean,
) => {
  if (!mine || message.recalledTime || message.pending || !message.id) return false;
  return isEditableTextMessage(message);
};

export const canRecallMessage = (
  message: PendingMessageModel,
  mine: boolean,
) => {
  if (!mine || message.recalledTime || message.pending || !message.id) return false;
  if (message.type === "system") return false;
  return true;
};

/**
 * Suy ra tin đã delivered tới member (direct chat horizon model).
 * Ưu tiên lastDeliveredMessageId — không phụ thuộc clock skew giữa
 * createdTime optimistic trên sender và deliveredTime từ recipient/server.
 * Fallback lastDeliveredTime >= createdTime theo spec backend.
 */
export const isMessageDeliveredToMember = (
  message: PendingMessageModel,
  member: ConversationModel_Member | undefined | null,
): boolean => {
  if (!member || !message.id) return false;

  const horizonMessageId = member.lastDeliveredMessageId;
  if (horizonMessageId) {
    if (horizonMessageId === message.id) return true;
    // Mongo ObjectId: so sánh lexicographic tương đương thứ tự thời gian
    if (
      horizonMessageId.length === message.id.length &&
      horizonMessageId > message.id
    ) {
      return true;
    }
  }

  if (member.lastDeliveredTime && message.createdTime) {
    const deliveredMs = dayjs(member.lastDeliveredTime).valueOf();
    const createdMs = dayjs(message.createdTime).valueOf();
    if (!Number.isNaN(deliveredMs) && !Number.isNaN(createdMs)) {
      return deliveredMs >= createdMs;
    }
  }

  return false;
};
