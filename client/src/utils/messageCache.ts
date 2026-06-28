import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { MessageCache, PendingMessageModel } from "../types/message.types";

/**
 * Cache tin nhắn của 1 conversation được lưu dưới dạng InfiniteData (useInfiniteQuery).
 *
 * Quy ước thứ tự (QUAN TRỌNG):
 * - Mỗi `page` là 1 MessageCache, messages bên trong xếp CŨ→MỚI.
 * - `pages` xếp theo CHRONOLOGICAL: pages[0] = trang CŨ nhất … pages[n-1] = trang MỚI nhất.
 *   Đạt được bằng `fetchPreviousPage` (prepend trang cũ hơn vào ĐẦU mảng pages).
 * - => Flatten = pages.flatMap(messages) cho ra đúng thứ tự render top(cũ)→bottom(mới).
 *
 * `pageParams[i]` tương ứng số trang đã fetch cho pages[i] (1 = mới nhất).
 *
 * pageParam để mặc định (unknown) khớp kiểu React Query suy ra cho useInfiniteQuery — helpers
 * chỉ thao tác trên `.pages`, không quan tâm kiểu pageParam.
 */
export type InfiniteMessageData = InfiniteData<MessageCache>;

export const messageKey = (conversationId: string) =>
  ["message", conversationId] as const;

// ---------------------------------------------------------------------------
// PURE TRANSFORMS (test được, không phụ thuộc QueryClient)
// ---------------------------------------------------------------------------

/** Tạo InfiniteData ban đầu từ 1 page (vd direct chat mới mở, chưa qua useInfiniteQuery). */
export const makeInfinite = (page: MessageCache): InfiniteMessageData => ({
  pages: [page],
  pageParams: [1],
});

/** Trả về toàn bộ messages phẳng theo thứ tự chronological (cũ→mới). */
export const flattenInfinite = (
  data: InfiniteMessageData | undefined,
): PendingMessageModel[] =>
  (data?.pages ?? []).flatMap((p) => p.messages ?? []);

/** Áp 1 transform MessageCache→MessageCache lên TỪNG page (dùng cho edit/recall/react/pin).
 *  An toàn vì các transform này match theo id → chỉ page chứa message đó thay đổi. */
export const mapInfinitePages = (
  data: InfiniteMessageData | undefined,
  fn: (page: MessageCache) => MessageCache,
): InfiniteMessageData | undefined => {
  if (!data) return data;
  return { ...data, pages: data.pages.map(fn) };
};

/** Append 1 message vào trang MỚI nhất (cuối mảng pages). Dedupe theo id trên TẤT CẢ pages
 *  (tránh trùng khi FCM gửi lại / optimistic + realtime cùng tới). No-op nếu chưa có page. */
export const appendToInfinite = (
  data: InfiniteMessageData | undefined,
  msg: PendingMessageModel,
): InfiniteMessageData | undefined => {
  if (!data || data.pages.length === 0) return data;
  if (msg.id && flattenInfinite(data).some((m) => m.id === msg.id)) return data;

  const lastIdx = data.pages.length - 1;
  const pages = data.pages.map((p, i) =>
    i === lastIdx ? { ...p, messages: [...(p.messages ?? []), msg] } : p,
  );
  return { ...data, pages };
};

/** Update message theo id (edit nội dung, đổi tmpId→realId, confirm pending…). updater nhận
 *  message hiện tại, trả về message mới. Tìm trên mọi page; no-op nếu không thấy id. */
export const updateInfiniteById = (
  data: InfiniteMessageData | undefined,
  id: string,
  updater: (msg: PendingMessageModel) => PendingMessageModel,
): InfiniteMessageData | undefined => {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((p) => ({
      ...p,
      messages: (p.messages ?? []).map((m) => (m.id === id ? updater(m) : m)),
    })),
  };
};

/** Xoá message theo id khỏi mọi page. */
export const removeFromInfinite = (
  data: InfiniteMessageData | undefined,
  id: string,
): InfiniteMessageData | undefined => {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((p) => ({
      ...p,
      messages: (p.messages ?? []).filter((m) => m.id !== id),
    })),
  };
};

// ---------------------------------------------------------------------------
// QUERYCLIENT-BOUND WRAPPERS (call-site dùng cái này, không chạm InfiniteData shape)
// ---------------------------------------------------------------------------

export const readMessageData = (qc: QueryClient, conversationId: string) =>
  qc.getQueryData<InfiniteMessageData>(messageKey(conversationId));

export const readFlatMessages = (qc: QueryClient, conversationId: string) =>
  flattenInfinite(readMessageData(qc, conversationId));

export const writeMessageData = (
  qc: QueryClient,
  conversationId: string,
  data: InfiniteMessageData | undefined,
) => qc.setQueryData(messageKey(conversationId), data);

export const appendMessage = (
  qc: QueryClient,
  conversationId: string,
  msg: PendingMessageModel,
) =>
  qc.setQueryData<InfiniteMessageData>(messageKey(conversationId), (old) =>
    appendToInfinite(old, msg),
  );

export const updateMessageById = (
  qc: QueryClient,
  conversationId: string,
  id: string,
  updater: (msg: PendingMessageModel) => PendingMessageModel,
) =>
  qc.setQueryData<InfiniteMessageData>(messageKey(conversationId), (old) =>
    updateInfiniteById(old, id, updater),
  );

export const removeMessageById = (
  qc: QueryClient,
  conversationId: string,
  id: string,
) =>
  qc.setQueryData<InfiniteMessageData>(messageKey(conversationId), (old) =>
    removeFromInfinite(old, id),
  );

/** Áp transform per-page (bọc các helper MessageCache→MessageCache cũ: edit/recall...). */
export const mutateMessagePages = (
  qc: QueryClient,
  conversationId: string,
  fn: (page: MessageCache) => MessageCache,
) =>
  qc.setQueryData<InfiniteMessageData>(messageKey(conversationId), (old) =>
    mapInfinitePages(old, fn),
  );
