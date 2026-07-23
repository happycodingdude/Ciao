import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  bookmarkMessage,
  getConversationBookmarkIds,
} from "../services/bookmark.service";

// Phase 3 — Bookmark: trạng thái "đã lưu" của các tin trong 1 hội thoại + toggle.
// Cache ["bookmarkIds", conversationId] = string[] messageId đã lưu (riêng tư per-user).
//
// eager: giống usePinMessage — hook mount ở NHIỀU nơi (Chatbox + mỗi MessageMenu). Chỉ Chatbox
// (eager=true) fetch /bookmarks/ids đúng 1 lần; observer theo từng message để eager=false → CHỈ
// ĐỌC cache (enabled:false), không tự bắn thêm request kể cả khi query lỗi/stale (fix double-call).
// (Đã thử lazy theo hover: gây chớp icon bookmark lần hover đầu → user chốt eager ở cấp hội thoại.)
export const useBookmark = (
  conversationId: string | undefined,
  eager: boolean = false,
) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: bookmarkIds } = useQuery({
    queryKey: ["bookmarkIds", conversationId],
    queryFn: () => getConversationBookmarkIds(conversationId!),
    enabled: eager && !!conversationId,
    staleTime: 5 * 60 * 1000,
    // Đồng bộ qua realtime + optimistic setQueryData → không refetch khi focus lại cửa sổ.
    refetchOnWindowFocus: false,
  });

  const isBookmarked = (messageId: string | undefined) =>
    !!messageId && (bookmarkIds ?? []).includes(messageId);

  const toggle = async (messageId: string, currentlyBookmarked: boolean) => {
    if (!conversationId || !messageId || saving) return;
    setSaving(true);
    try {
      await bookmarkMessage(conversationId, messageId, !currentlyBookmarked);
      queryClient.setQueryData<string[]>(
        ["bookmarkIds", conversationId],
        (old) =>
          currentlyBookmarked
            ? (old ?? []).filter((id) => id !== messageId)
            : [...(old ?? []), messageId],
      );
      // Trang "Tin nhắn đã lưu" refetch lần xem tới.
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      // Panel "Saved messages" trong khung chat: mark stale để lần mở tới refetch
      // (panel đang đóng → không bắn request ngay, chỉ refetch khi query enabled lại).
      queryClient.invalidateQueries({
        queryKey: ["conversationBookmarks", conversationId],
      });
    } finally {
      setSaving(false);
    }
  };

  return { isBookmarked, toggle, saving };
};
