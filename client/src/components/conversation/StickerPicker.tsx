import { useMemo, useState } from "react";
import {
  STICKER_PACKS,
  Sticker,
  getStickerById,
  searchStickers,
} from "../../data/stickers";
import { useStickerFavorites } from "../../hooks/useStickerFavorites";
import "../../styles/stickerPicker.css";
import LazyEmojiPicker from "../common/LazyEmojiPicker";
import LottiePlayer from "../common/LottiePlayer";

type Props = {
  onSelect: (stickerId: string) => void;
  // Tab Emoji: chèn emoji (ký tự native) vào ô nhập — panel không tự đóng.
  onEmojiSelect: (native: string) => void;
};

// Tab đặc biệt đứng cạnh các Sticker Pack (pack render động từ registry).
const TAB_RECENT = "__recent";
const TAB_FAVORITE = "__favorite";
const TAB_EMOJI = "__emoji";

// Panel Emoji & Sticker chung (1 nút trên toolbar):
// - Tab Emoji (mặc định): emoji picker đầy đủ (emoji-mart, có search riêng) → chèn vào ô nhập.
// - Tab Gần đây / Yêu thích / từng pack: sticker, click → gửi ngay.
// - Ô "Tìm sticker" chỉ hiện ở các tab sticker; hover sticker có nút ⭐ toggle yêu thích.
// - Sticker .tgs phát animation ngay trong picker (LottiePlayer tự pause ngoài viewport).
const StickerPicker = ({ onSelect, onEmojiSelect }: Props) => {
  const { recents, favorites, isFavorite, toggleFavorite } =
    useStickerFavorites();
  const [tab, setTab] = useState<string>(TAB_EMOJI);
  const [query, setQuery] = useState("");

  // Map id → sticker, bỏ id không còn hợp lệ (pack đã gỡ khỏi registry).
  const recentStickers = useMemo(
    () => recents.map(getStickerById).filter((st): st is Sticker => !!st),
    [recents],
  );
  const favoriteStickers = useMemo(
    () => favorites.map(getStickerById).filter((st): st is Sticker => !!st),
    [favorites],
  );

  const searchResults = useMemo(() => searchStickers(query), [query]);
  const isEmojiTab = tab === TAB_EMOJI;
  const searching = !isEmojiTab && query.trim().length > 0;

  const activePack = STICKER_PACKS.find((p) => p.id === tab);
  const gridStickers = searching
    ? searchResults
    : tab === TAB_RECENT
      ? recentStickers
      : tab === TAB_FAVORITE
        ? favoriteStickers
        : (activePack?.stickers ?? []);

  const emptyText = searching
    ? "Không tìm thấy sticker phù hợp"
    : tab === TAB_RECENT
      ? "Chưa có sticker dùng gần đây"
      : tab === TAB_FAVORITE
        ? "Chưa có sticker yêu thích — bấm ⭐ trên sticker để lưu"
        : "Pack trống";

  const openTab = (next: string) => {
    setTab(next);
    setQuery("");
  };

  return (
    <div className="sticker-picker flex h-96 w-88 flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--bubble-bg) shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      {isEmojiTab ? (
        // emoji-mart có thanh search riêng → chiếm trọn vùng body.
        <div className="flex-1 overflow-hidden">
          <LazyEmojiPicker
            onEmojiSelect={(e: { native: string }) => onEmojiSelect(e.native)}
            // Panel đóng/mở do ChatInput quản (click ngoài .sticker-picker) — noop.
            onClickOutside={() => {}}
          />
        </div>
      ) : (
        <>
          {/* Tìm kiếm theo từ khóa trên mọi pack sticker */}
          <div className="p-2 pb-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sticker…"
              className="w-full rounded-xl bg-(--toolbar-btn-bg) px-3 py-1.5 text-sm text-(--text-main-color) outline-none placeholder:text-(--text-main-color-blur)"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {gridStickers.length === 0 ? (
              <p className="mt-8 text-center text-xs text-(--text-main-color-blur)">
                {emptyText}
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {gridStickers.map((st) => (
                  <StickerButton
                    key={st.id}
                    sticker={st}
                    favorite={isFavorite(st.id)}
                    onToggleFavorite={() => toggleFavorite(st.id)}
                    onClick={() => onSelect(st.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Gần đây / Yêu thích / từng pack (từ registry) / Emoji */}
      <div className="flex items-center gap-1 border-t border-(--border-color) px-2 py-1.5">
        <TabButton
          active={!searching && tab === TAB_RECENT}
          label="Gần đây"
          onClick={() => openTab(TAB_RECENT)}
        >
          <i className="fa-regular fa-clock" />
        </TabButton>
        <TabButton
          active={!searching && tab === TAB_FAVORITE}
          label="Yêu thích"
          onClick={() => openTab(TAB_FAVORITE)}
        >
          <i className="fa-regular fa-star" />
        </TabButton>
        {STICKER_PACKS.map((pack) => (
          <TabButton
            key={pack.id}
            active={!searching && tab === pack.id}
            label={pack.name}
            onClick={() => openTab(pack.id)}
          >
            <span className="text-sm leading-none">{pack.icon}</span>
          </TabButton>
        ))}
        <TabButton
          active={isEmojiTab}
          label="Emoji"
          onClick={() => openTab(TAB_EMOJI)}
        >
          <i className="fa-regular fa-face-smile" />
        </TabButton>
      </div>
    </div>
  );
};

const TabButton = ({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    className={`flex h-8 flex-1 items-center justify-center rounded-lg text-(--text-main-color-blur) transition-colors
      ${active ? "bg-(--toolbar-btn-bg) text-(--text-main-color)" : "hover:bg-(--toolbar-btn-bg)"}`}
  >
    {children}
  </button>
);

const StickerButton = ({
  sticker,
  favorite,
  onToggleFavorite,
  onClick,
}: {
  sticker: Sticker;
  favorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}) => (
  <div className="group relative">
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-square w-full items-center justify-center rounded-xl p-1.5 transition-transform hover:scale-110 hover:bg-(--toolbar-btn-bg)"
    >
      {sticker.kind === "tgs" ? (
        <LottiePlayer
          src={sticker.url}
          className="h-full w-full"
          fallback={<i className="fa-regular fa-face-smile text-2xl text-(--text-main-color-blur)" />}
        />
      ) : (
        <img
          src={sticker.url}
          alt="sticker"
          className="h-full w-full object-contain"
          loading="lazy"
        />
      )}
    </button>
    {/* Toggle yêu thích: hiện khi hover ô sticker (luôn hiện nếu đã ⭐). */}
    <button
      type="button"
      title={favorite ? "Bỏ yêu thích" : "Yêu thích"}
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite();
      }}
      className={`absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-(--bubble-bg) text-2xs shadow
        ${favorite ? "text-yellow-400" : "text-(--text-main-color-blur) opacity-0 group-hover:opacity-100"}`}
    >
      <i className={`${favorite ? "fa-solid" : "fa-regular"} fa-star`} />
    </button>
  </div>
);

export default StickerPicker;
