import { useMemo } from "react";
import { useStickerFavorites } from "../../hooks/useStickerFavorites";
import {
  ALL_STICKERS,
  STICKER_PACKS,
  getStickerById,
} from "../../data/stickers";

type Props = {
  onSelect: (stickerId: string) => void;
};

// Bảng chọn sticker: hàng "Gần đây" (nếu có) + các pack built-in. Click 1 sticker → gửi ngay.
const StickerPicker = ({ onSelect }: Props) => {
  const { favorites } = useStickerFavorites();

  // Map favorites (id) → sticker object, bỏ id không còn hợp lệ.
  const recent = useMemo(
    () => favorites.map(getStickerById).filter(Boolean).slice(0, 8),
    [favorites],
  );

  return (
    <div className="sticker-picker flex h-80 w-80 flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--bubble-bg) shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <div className="flex-1 overflow-y-auto p-3">
        {recent.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-(--text-main-color-blur)">
              Gần đây
            </p>
            <div className="grid grid-cols-4 gap-2">
              {recent.map((st) => (
                <StickerButton key={`recent-${st!.id}`} url={st!.url} onClick={() => onSelect(st!.id)} />
              ))}
            </div>
          </div>
        )}

        {STICKER_PACKS.map((pack) => (
          <div key={pack.id} className="mb-3">
            <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-(--text-main-color-blur)">
              {pack.name}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {pack.stickers.map((st) => (
                <StickerButton key={st.id} url={st.url} onClick={() => onSelect(st.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-(--border-color) px-3 py-1.5 text-3xs text-(--text-main-color-blur)">
        {ALL_STICKERS.length} nhãn dán
      </p>
    </div>
  );
};

const StickerButton = ({ url, onClick }: { url: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex aspect-square items-center justify-center rounded-xl p-1.5 transition-transform hover:scale-110 hover:bg-(--toolbar-btn-bg)"
  >
    <img src={url} alt="sticker" className="h-full w-full object-contain" loading="lazy" />
  </button>
);

export default StickerPicker;
