import { MessageModel } from "../types/message.types";

// Reaction Pack — data-driven: toàn bộ hiển thị reaction (emoji, nhãn, asset động/tĩnh)
// định nghĩa ở đây; thêm/đổi reaction = sửa data, không sửa logic component.
//
// `key` là mã lưu trữ phía BE (Shared/Constants/MessageReactionType.cs) — BE chỉ
// aggregate 6 key cố định like/love/care/wow/sad/angry nên FE phải dùng đúng các key
// này. Key là mã opaque: emoji hiển thị do pack quyết định (😂 dùng slot "care";
// reaction chưa từng được nối vào UI trước đây nên không có dữ liệu cũ xung đột).
//
// Asset đồng bộ 1 style Fluent: bản Animated (APNG /public/reactions) cho bảng chọn;
// bản 3D TĨNH chính thức (MIT, /public/reactions/static) cho chip tổng, icon đã-react
// trong menu và fallback khi bật "giảm chuyển động" — cùng art style, chỉ khác động/tĩnh.

export type ReactionCountField =
  | "likeCount"
  | "loveCount"
  | "careCount"
  | "wowCount"
  | "sadCount"
  | "angryCount";

export type ReactionDef = {
  key: string;
  emoji: string;
  label: string;
  animatedSrc: string;
  staticSrc: string;
  countField: ReactionCountField;
};

export const DEFAULT_REACTION_PACK: ReactionDef[] = [
  { key: "like",  emoji: "👍", label: "Thích",   animatedSrc: "/reactions/like.png",  staticSrc: "/reactions/static/like.png",  countField: "likeCount" },
  { key: "love",  emoji: "❤️", label: "Yêu thích", animatedSrc: "/reactions/love.png",  staticSrc: "/reactions/static/love.png",  countField: "loveCount" },
  // 😂 dùng slot "care" của BE (6 key aggregate cố định); key là mã opaque, hiển thị do pack quyết định.
  { key: "care",  emoji: "😂", label: "Haha",    animatedSrc: "/reactions/haha.png",  staticSrc: "/reactions/static/haha.png",  countField: "careCount" },
  { key: "wow",   emoji: "😮", label: "Wow",     animatedSrc: "/reactions/wow.png",   staticSrc: "/reactions/static/wow.png",   countField: "wowCount" },
  { key: "sad",   emoji: "😢", label: "Buồn",    animatedSrc: "/reactions/sad.png",   staticSrc: "/reactions/static/sad.png",   countField: "sadCount" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ", animatedSrc: "/reactions/angry.png", staticSrc: "/reactions/static/angry.png", countField: "angryCount" },
];

const BY_KEY = new Map(DEFAULT_REACTION_PACK.map((r) => [r.key, r]));

/** Key lạ (data cũ/pack đã gỡ) → undefined, nơi gọi tự bỏ qua — không crash. */
export const getReactionDef = (key?: string | null): ReactionDef | undefined =>
  key ? BY_KEY.get(key) : undefined;

/** Tổng hợp cho chip trên tin: tổng số reaction + tối đa 3 loại nhiều nhất. */
export const summarizeReactions = (m: MessageModel) => {
  const entries = DEFAULT_REACTION_PACK.map((def) => ({
    def,
    count: m[def.countField] ?? 0,
  })).filter((e) => e.count > 0);
  entries.sort((a, b) => b.count - a.count);
  return {
    total: entries.reduce((sum, e) => sum + e.count, 0),
    top: entries.slice(0, 3).map((e) => e.def),
  };
};
