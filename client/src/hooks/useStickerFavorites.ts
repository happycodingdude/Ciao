import { useQuery, useQueryClient } from "@tanstack/react-query";

// Sticker "yêu thích" / dùng gần đây: lưu danh sách id sticker theo thứ tự mới nhất
// trước. Cục bộ theo thiết bị (localStorage) + reactive qua React Query cache để picker
// cập nhật ngay sau khi gửi. Giới hạn số lượng để danh sách gọn.

const FAV_KEY = ["sticker-favorites"] as const;
const LS_KEY = "sticker_favorites";
const MAX_FAVORITES = 16;

const load = (): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    return Array.isArray(raw) ? (raw as string[]) : [];
  } catch {
    return [];
  }
};

const persist = (ids: string[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    // Bỏ qua lỗi quota/private-mode — favorites chỉ là tiện ích.
  }
};

export const useStickerFavorites = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery<string[]>({
    queryKey: FAV_KEY,
    queryFn: load,
    initialData: load,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Ghi nhận sticker vừa dùng: đưa lên đầu, khử trùng lặp, cắt theo giới hạn.
  const markUsed = (id: string) => {
    queryClient.setQueryData<string[]>(FAV_KEY, (old) => {
      const next = [id, ...(old ?? []).filter((x) => x !== id)].slice(0, MAX_FAVORITES);
      persist(next);
      return next;
    });
  };

  return { favorites: data ?? [], markUsed };
};
