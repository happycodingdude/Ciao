import { useQuery, useQueryClient } from "@tanstack/react-query";

// Sticker "gần đây" + "yêu thích": 2 danh sách id độc lập, cục bộ theo thiết bị
// (localStorage) + reactive qua React Query cache để picker cập nhật ngay.
// - recents: tự ghi nhận khi gửi, mới nhất trước, giới hạn số lượng.
//   (giữ LS key cũ "sticker_favorites" — trước đây danh sách này đóng vai recents —
//   để không mất dữ liệu người dùng hiện có)
// - favorites: người dùng tự đánh dấu ⭐ trong picker, toggle thêm/gỡ.

const RECENT_KEY = ["sticker-recents"] as const;
const FAV_KEY = ["sticker-starred"] as const;
const LS_RECENT = "sticker_favorites";
const LS_FAV = "sticker_starred";
const MAX_RECENTS = 16;

const load = (lsKey: string): string[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(lsKey) || "[]");
    return Array.isArray(raw) ? (raw as string[]) : [];
  } catch {
    return [];
  }
};

const persist = (lsKey: string, ids: string[]) => {
  try {
    localStorage.setItem(lsKey, JSON.stringify(ids));
  } catch {
    // Bỏ qua lỗi quota/private-mode — recents/favorites chỉ là tiện ích.
  }
};

export const useStickerFavorites = () => {
  const queryClient = useQueryClient();

  const { data: recents } = useQuery<string[]>({
    queryKey: RECENT_KEY,
    queryFn: () => load(LS_RECENT),
    initialData: () => load(LS_RECENT),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: favorites } = useQuery<string[]>({
    queryKey: FAV_KEY,
    queryFn: () => load(LS_FAV),
    initialData: () => load(LS_FAV),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Ghi nhận sticker vừa dùng: đưa lên đầu, khử trùng lặp, cắt theo giới hạn.
  const markUsed = (id: string) => {
    queryClient.setQueryData<string[]>(RECENT_KEY, (old) => {
      const next = [id, ...(old ?? []).filter((x) => x !== id)].slice(
        0,
        MAX_RECENTS,
      );
      persist(LS_RECENT, next);
      return next;
    });
  };

  const isFavorite = (id: string) => (favorites ?? []).includes(id);

  const toggleFavorite = (id: string) => {
    queryClient.setQueryData<string[]>(FAV_KEY, (old) => {
      const cur = old ?? [];
      const next = cur.includes(id)
        ? cur.filter((x) => x !== id)
        : [id, ...cur];
      persist(LS_FAV, next);
      return next;
    });
  };

  return {
    recents: recents ?? [],
    favorites: favorites ?? [],
    markUsed,
    isFavorite,
    toggleFavorite,
  };
};
