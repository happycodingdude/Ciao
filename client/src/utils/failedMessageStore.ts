import { ReplyState } from "../hooks/useReply";
import { PendingMessageModel, SendMessageRequest } from "../types/message.types";

// Lưu tin GỬI LỖI để:
//  1. Tin lỗi KHÔNG mất khi tải lại trang → persist bản serializable vào localStorage.
//  2. Gửi lại được: tin text tái tạo param từ bản persist; tin có tệp thì cần File gốc
//     (không serialize được) nên giữ trong RAM theo phiên — reload xong media không resend
//     được (phải đính kèm lại), nhưng tin lỗi vẫn hiển thị.

const LS_KEY = "failed_messages";

// Bản ghi serializable đủ để hiển thị lại tin lỗi và gửi lại tin text sau khi reload.
export type FailedRecord = {
  id: string;
  type: string;
  content: string;
  mentions?: string[];
  createdTime: string;
  hasAttachment: boolean;
  attachmentNames?: string[];
  // Snapshot reply lúc gửi (nếu có)
  replyId?: string;
  replyContact?: string;
  replyContactName?: string;
  replyContent?: string;
};

type Store = Record<string, FailedRecord[]>;

// RAM phiên hiện tại: giữ param gốc (kèm File) để gửi lại đầy đủ khi CHƯA reload.
const sessionParams = new Map<string, { param: SendMessageRequest; reply: ReplyState }>();
const key = (conversationId: string, id: string) => `${conversationId}:${id}`;

const read = (): Store => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as Store;
  } catch {
    return {};
  }
};

const write = (store: Store) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    // Bỏ qua lỗi quota — không được làm vỡ luồng chat.
  }
};

export const rememberSessionParam = (
  conversationId: string,
  id: string,
  param: SendMessageRequest,
  reply: ReplyState,
) => sessionParams.set(key(conversationId, id), { param, reply });

// Lưu bản persist khi tin thực sự lỗi (idempotent theo id).
export const persistFailed = (conversationId: string, record: FailedRecord) => {
  const store = read();
  const arr = store[conversationId] ?? [];
  if (arr.some((r) => r.id === record.id)) return;
  store[conversationId] = [...arr, record];
  write(store);
};

export const getPersistedFailed = (conversationId: string): FailedRecord[] =>
  read()[conversationId] ?? [];

// Gỡ tin lỗi khỏi cả persist lẫn RAM (khi gửi lại thành công).
export const removeFailed = (conversationId: string, id: string) => {
  sessionParams.delete(key(conversationId, id));
  const store = read();
  const arr = store[conversationId];
  if (!arr) return;
  const next = arr.filter((r) => r.id !== id);
  if (next.length) store[conversationId] = next;
  else delete store[conversationId];
  write(store);
};

// Lấy param để gửi lại. Ưu tiên bản RAM (còn File) → tin nào cũng gửi lại được trong phiên.
// Sau reload: chỉ tái tạo được tin text; tin có tệp trả về "needsReattach" để báo người dùng.
export const getResendParam = (
  conversationId: string,
  id: string,
):
  | { ok: true; param: SendMessageRequest; reply: ReplyState }
  | { ok: false; needsReattach: boolean } => {
  const session = sessionParams.get(key(conversationId, id));
  if (session) return { ok: true, param: session.param, reply: session.reply };

  const record = getPersistedFailed(conversationId).find((r) => r.id === id);
  if (!record) return { ok: false, needsReattach: false };
  // Tin có tệp mà mất File (đã reload) → không thể re-upload tự động.
  if (record.hasAttachment) return { ok: false, needsReattach: true };

  const param: SendMessageRequest = {
    type: record.type,
    content: record.content,
    ...(record.mentions?.length ? { mentions: record.mentions } : {}),
  };
  const reply: ReplyState = record.replyId
    ? {
        replyId: record.replyId,
        replyContact: record.replyContact,
        replyContactName: record.replyContactName,
        replyContent: record.replyContent,
      }
    : null;
  return { ok: true, param, reply };
};

// Dựng PendingMessageModel (trạng thái failed) từ bản persist để render lại sau reload.
export const buildFailedPending = (
  record: FailedRecord,
  selfId?: string,
): PendingMessageModel => ({
  id: record.id,
  type: record.type,
  content: record.content,
  contactId: selfId,
  createdTime: record.createdTime,
  pending: false,
  failed: true,
  likeCount: 0,
  loveCount: 0,
  careCount: 0,
  wowCount: 0,
  sadCount: 0,
  angryCount: 0,
  currentReaction: null,
  attachments: record.hasAttachment
    ? (record.attachmentNames ?? []).map((name) => ({
        type: "image",
        mediaName: name,
        pending: false,
      }))
    : [],
  ...(record.replyId
    ? {
        replyId: record.replyId,
        replyContact: record.replyContact,
        replyContent: record.replyContent,
      }
    : {}),
});

// Build FailedRecord từ param + reply (dùng khi tin lỗi để persist).
export const buildFailedRecord = (
  id: string,
  param: SendMessageRequest,
  reply: ReplyState,
  createdTime: string,
): FailedRecord => {
  const hasAttachment = (param.files ?? []).length !== 0;
  return {
    id,
    type: param.type,
    content: param.content,
    ...(param.mentions?.length ? { mentions: param.mentions } : {}),
    createdTime,
    hasAttachment,
    ...(hasAttachment
      ? { attachmentNames: (param.files ?? []).map((f) => f.name) }
      : {}),
    ...(reply
      ? {
          replyId: reply.replyId,
          replyContact: reply.replyContact,
          replyContactName: reply.replyContactName,
          replyContent: reply.replyContent,
        }
      : {}),
  };
};
