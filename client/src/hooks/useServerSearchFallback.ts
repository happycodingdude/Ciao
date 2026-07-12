import { useEffect, useRef, useState } from "react";

// Logic search đồng bộ cho các panel có danh sách đã tải sẵn (Pinned / Bookmark):
// 1. Keyword được filter client-side trong list đã load (caller tự tính localMatches).
// 2. Local KHÔNG match → fallback gọi API search theo keyword (debounce 400ms).
// 3. Stale guard: chỉ nhận response của request mới nhất — response cũ về muộn bị bỏ qua.
// Clear keyword / local match trở lại → serverResults tự reset, không còn request treo.
export const useServerSearchFallback = <T>(
  trimmedKeyword: string,
  localMatchCount: number,
  fetcher: (keyword: string) => Promise<T[] | undefined>,
) => {
  const [serverResults, setServerResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);

  // Đánh dấu request search mới nhất — response cũ về muộn sẽ bị bỏ qua (stale guard).
  const refSearchSeq = useRef(0);
  const refDebounce = useRef<ReturnType<typeof setTimeout>>();
  // fetcher là closure mới mỗi render (bắt conversationId) → giữ qua ref để effect
  // không cần đưa vào deps (tránh re-run mỗi render).
  const refFetcher = useRef(fetcher);
  refFetcher.current = fetcher;

  const needServerSearch = !!trimmedKeyword && localMatchCount === 0;

  useEffect(() => {
    clearTimeout(refDebounce.current);
    if (!needServerSearch) {
      setServerResults([]);
      setSearching(false);
      return;
    }
    const seq = ++refSearchSeq.current;
    setSearching(true);
    refDebounce.current = setTimeout(() => {
      refFetcher
        .current(trimmedKeyword)
        .then((data) => {
          if (seq === refSearchSeq.current) setServerResults(data ?? []);
        })
        .finally(() => {
          if (seq === refSearchSeq.current) setSearching(false);
        });
    }, 400);
    return () => clearTimeout(refDebounce.current);
  }, [needServerSearch, trimmedKeyword]);

  return { needServerSearch, serverResults, searching };
};
