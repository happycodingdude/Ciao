// Catalog sticker built-in (đóng gói sẵn, phục vụ từ /public/stickers — self-contained,
// không phụ thuộc dịch vụ ngoài). Giai đoạn đầu chưa cho người dùng tự tải lên.
// Sticker id = đường dẫn asset, đồng thời là Message.Content khi gửi.

export type Sticker = {
  id: string; // = url, dùng làm Content của tin nhắn sticker
  url: string;
  keywords: string[];
};

export type StickerPack = {
  id: string;
  name: string;
  cover: string; // sticker đại diện cho tab pack
  stickers: Sticker[];
};

const s = (name: string, keywords: string[]): Sticker => ({
  id: `/stickers/${name}.svg`,
  url: `/stickers/${name}.svg`,
  keywords,
});

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "smileys",
    name: "Smileys",
    cover: "/stickers/happy.svg",
    stickers: [
      s("happy", ["happy", "smile", "vui"]),
      s("grin", ["laugh", "grin", "cười"]),
      s("love", ["love", "heart", "thích", "yêu"]),
      s("wink", ["wink", "nháy mắt"]),
      s("cool", ["cool", "ngầu"]),
      s("wow", ["wow", "surprise", "ngạc nhiên"]),
      s("kiss", ["kiss", "hôn"]),
      s("sad", ["sad", "buồn"]),
      s("cry", ["cry", "khóc"]),
      s("angry", ["angry", "giận"]),
    ],
  },
];

// Tra ngược nhanh id → sticker (fallback placeholder khi id lạ).
export const ALL_STICKERS: Sticker[] = STICKER_PACKS.flatMap((p) => p.stickers);

const STICKER_BY_ID = new Map(ALL_STICKERS.map((st) => [st.id, st]));

export const isStickerId = (id?: string | null): boolean =>
  !!id && STICKER_BY_ID.has(id);

export const getStickerById = (id?: string | null): Sticker | undefined =>
  id ? STICKER_BY_ID.get(id) : undefined;
