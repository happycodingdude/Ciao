/**
 * Phase 4 — Đợt 1: Emoji cỡ lớn + Emoji động.
 *
 * Phát hiện tin nhắn "emoji-only" để hiển thị cỡ lớn (không bọc bong bóng)
 * và tra cứu hiệu ứng chuyển động cho một tập emoji hỗ trợ.
 *
 * Đếm emoji theo GRAPHEME (Intl.Segmenter) thay vì code point để emoji ghép
 * (ZWJ như 👨‍👩‍👧, cờ 🇻🇳, skin-tone 👍🏽) được tính là MỘT emoji, giữ nguyên ý nghĩa.
 */

/** Ngưỡng tối đa số emoji để hiển thị cỡ lớn (vượt ngưỡng → cỡ thường). */
export const BIG_EMOJI_MAX = 5;

export type EmojiOnlyInfo = {
  /** Danh sách emoji (mỗi phần tử là 1 grapheme) theo thứ tự xuất hiện. */
  emojis: string[];
  /** true khi số emoji trong ngưỡng BIG_EMOJI_MAX → render cỡ lớn. */
  isBigEmoji: boolean;
};

// Một grapheme được coi là emoji khi chứa ký tự tượng hình mở rộng,
// là cặp Regional Indicator (cờ quốc gia) hoặc keycap (1️⃣, #️⃣ — chứa U+20E3).
const isEmojiGrapheme = (g: string): boolean =>
  /\p{Extended_Pictographic}/u.test(g) ||
  /^\p{Regional_Indicator}{2}$/u.test(g) ||
  /⃣/u.test(g);

/**
 * Phân tích nội dung tin nhắn: trả về info nếu tin CHỈ chứa emoji
 * (cho phép lẫn khoảng trắng), ngược lại trả null.
 * Môi trường không có Intl.Segmenter → trả null (fallback hiển thị thường).
 */
export function analyzeEmojiOnly(
  content?: string | null,
): EmojiOnlyInfo | null {
  if (!content) return null;
  // Emoji lẫn khoảng trắng vẫn coi là emoji-only → loại bỏ trước khi xét.
  const compact = content.replace(/\s+/gu, "");
  if (!compact) return null;
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    return null;
  }

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const graphemes = Array.from(segmenter.segment(compact), (s) => s.segment);
  if (graphemes.length === 0 || !graphemes.every(isEmojiGrapheme)) {
    return null;
  }

  return {
    emojis: graphemes,
    isBigEmoji: graphemes.length <= BIG_EMOJI_MAX,
  };
}

/**
 * Tập emoji hỗ trợ chuyển động (giai đoạn đầu — theo kế hoạch chỉ một tập
 * định sẵn). Key là emoji ĐÃ CHUẨN HÓA: bỏ variation selector (U+FE0F), ZWJ
 * (U+200D) và skin-tone modifier để 👍🏽/👍 cùng nhận một hiệu ứng.
 */
const ANIMATION_BY_EMOJI: Record<string, string> = {
  "❤": "beat",
  "💖": "beat",
  "💗": "beat",
  "💓": "beat",
  "💕": "beat",
  "😍": "beat",
  "🥰": "beat",
  "😘": "beat",
  "😂": "laugh",
  "🤣": "laugh",
  "🎉": "tada",
  "🎊": "tada",
  "🥳": "tada",
  "👋": "wave",
  "👍": "bump",
  "👎": "bump",
  "👏": "bump",
  "😭": "cry",
  "😢": "cry",
  "😡": "angry",
  "🤬": "angry",
  "🔥": "flicker",
};

/** Trả về tên hiệu ứng cho emoji, hoặc null nếu emoji không hỗ trợ chuyển động. */
export function getEmojiAnimation(grapheme: string): string | null {
  const base = grapheme.replace(/[️‍]|\p{Emoji_Modifier}/gu, "");
  return ANIMATION_BY_EMOJI[base] ?? null;
}
