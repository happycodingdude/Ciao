// Sticker Pack registry — data-driven: đóng gói sẵn, phục vụ từ /public/stickers
// (self-contained, không phụ thuộc dịch vụ ngoài). Thêm pack mới = thêm assets vào
// /public/stickers/<pack>/ + khai báo 1 entry ở đây — không sửa logic picker/render.
// Sticker id = đường dẫn asset, đồng thời là Message.Content khi gửi.
// kind: "image" = ảnh tĩnh (svg/png/webp) render bằng <img>;
//       "tgs"   = Telegram Animated Sticker (Lottie JSON nén gzip) render bằng LottiePlayer.

export type StickerKind = "image" | "tgs";

export type Sticker = {
  id: string; // = url, dùng làm Content của tin nhắn sticker
  url: string;
  kind: StickerKind;
  keywords: string[];
};

export type StickerPack = {
  id: string;
  name: string;
  icon: string; // emoji đại diện cho tab pack trong picker
  stickers: Sticker[];
};

// Sticker động: Noto Animated Emoji (Google, license mở) đóng gói lại đúng chuẩn
// .tgs — pipeline render dùng chung cho mọi pack .tgs bổ sung sau.
const t = (name: string, keywords: string[]): Sticker => ({
  id: `/stickers/animated/${name}.tgs`,
  url: `/stickers/animated/${name}.tgs`,
  kind: "tgs",
  keywords,
});

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "animated",
    name: "Animated",
    icon: "✨",
    stickers: [
      t("heart", ["heart", "love", "tim", "yêu"]),
      t("haha", ["laugh", "haha", "cười", "joy"]),
      t("hearteyes", ["love", "mê", "thích", "heart eyes"]),
      t("sob", ["cry", "sob", "khóc"]),
      t("party", ["party", "tiệc", "chúc mừng", "congrats"]),
      t("partyface", ["party", "vui", "sinh nhật", "birthday"]),
      t("thumbsup", ["like", "ok", "thumbs up", "đồng ý"]),
      t("clap", ["clap", "vỗ tay", "bravo"]),
      t("fire", ["fire", "lửa", "hot", "cháy"]),
      t("hundred", ["100", "perfect", "tuyệt"]),
    ],
  },
];
// Pack "Smileys" (SVG tĩnh) đã gỡ khỏi picker — thay bằng tab Emoji (emoji picker đầy đủ).
// Asset cũ vẫn giữ ở /public/stickers/*.svg để tin sticker đã gửi trước đây render bình thường
// (StickerMessage render theo URL trong content, không tra catalog).

// Tra ngược nhanh id → sticker (fallback placeholder khi id lạ).
export const ALL_STICKERS: Sticker[] = STICKER_PACKS.flatMap((p) => p.stickers);

const STICKER_BY_ID = new Map(ALL_STICKERS.map((st) => [st.id, st]));

export const isStickerId = (id?: string | null): boolean =>
  !!id && STICKER_BY_ID.has(id);

export const getStickerById = (id?: string | null): Sticker | undefined =>
  id ? STICKER_BY_ID.get(id) : undefined;

/** Tìm sticker theo từ khóa (không phân biệt hoa thường) trên mọi pack. */
export const searchStickers = (query: string): Sticker[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_STICKERS.filter((st) =>
    st.keywords.some((k) => k.toLowerCase().includes(q)),
  );
};
