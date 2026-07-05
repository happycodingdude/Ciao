import { useMemo, useState } from "react";
import { GIFS } from "../../data/gifs";

type Props = {
  onSelect: (gifUrl: string) => void;
};

// Bảng chọn GIF từ nguồn sẵn (không upload). Có ô lọc theo từ khóa.
const GifPicker = ({ onSelect }: Props) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? GIFS.filter((g) => g.keywords.some((k) => k.includes(q))) : GIFS;
  }, [query]);

  return (
    <div className="gif-picker flex h-80 w-80 flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--bubble-bg) shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <div className="p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm GIF…"
          className="w-full rounded-xl border border-(--border-color) bg-(--search-bg-color) px-3 py-1.5 text-sm text-(--text-main-color) outline-none"
        />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto px-2 pb-2">
        {filtered.map((gif) => (
          <button
            key={gif.url}
            type="button"
            onClick={() => onSelect(gif.url)}
            className="overflow-hidden rounded-xl transition-transform hover:scale-[1.03]"
          >
            <img src={gif.url} alt="gif" loading="lazy" className="h-24 w-full object-cover" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 py-8 text-center text-(--text-main-color-blur)">Không có GIF phù hợp</p>
        )}
      </div>
    </div>
  );
};

export default GifPicker;
