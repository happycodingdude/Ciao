import { useQuery, useQueryClient } from "@tanstack/react-query";

// Draft = nội dung đang soạn dở, lưu riêng theo từng hội thoại.
// Nguồn chân lý: React Query cache ["draft"] (reactive → ChatInput lẫn ConversationItem
// cùng đọc/ghi được) + persist localStorage để sống sót khi tải lại trang.
// Phạm vi Phase 1: chỉ lưu phần văn bản; cục bộ theo thiết bị, không đồng bộ đa thiết bị.

const DRAFT_KEY = ["draft"] as const;
const LS_KEY = "chat_drafts";

export type DraftMap = Record<string, string>;

const loadDrafts = (): DraftMap => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as DraftMap;
  } catch {
    return {};
  }
};

const persist = (drafts: DraftMap) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(drafts));
  } catch {
    // Bỏ qua lỗi quota/private-mode — draft chỉ là tiện ích, không được làm vỡ luồng chat.
  }
};

export const useDrafts = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery<DraftMap>({
    queryKey: DRAFT_KEY,
    queryFn: loadDrafts,
    initialData: loadDrafts,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const setDraft = (conversationId: string, text: string) => {
    queryClient.setQueryData<DraftMap>(DRAFT_KEY, (old) => {
      const next = { ...(old ?? {}) };
      // Rỗng (chỉ khoảng trắng) → xóa hẳn để không hiện chỉ báo "Bản nháp" thừa.
      if (text.trim()) next[conversationId] = text;
      else delete next[conversationId];
      persist(next);
      return next;
    });
  };

  const clearDraft = (conversationId: string) => setDraft(conversationId, "");

  return { drafts: data ?? {}, setDraft, clearDraft };
};
