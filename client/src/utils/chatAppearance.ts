// Phase 3 — Đợt 3: preset hình nền chat + màu bong bóng (chung cho cả hội thoại).
// BE chỉ lưu KEY (string ≤50 ký tự, null = mặc định) trên Conversation;
// giá trị màu thực tế nằm ở FE trong styles/chatAppearance.css (class theo key,
// có biến thể light/dark riêng nên tự đổi theo theme, không cần đọc theme trong JS).

export type AppearancePreset = {
  key: string;
  label: string;
};

// Hình nền: gradient dịu theo theme — light dùng pastel sáng, dark dùng tông trầm
// cùng hue (đảm bảo text/date-divider trên nền vẫn đọc được, không cần lớp phủ).
export const WALLPAPER_PRESETS: AppearancePreset[] = [
  { key: "mint", label: "Mint" },
  { key: "sunset", label: "Sunset" },
  { key: "lavender", label: "Lavender" },
  { key: "rose", label: "Rose" },
  { key: "graphite", label: "Graphite" },
];

// Màu bong bóng (áp cho MỌI tin nhắn trong hội thoại): màu bão hòa + chữ trắng —
// đạt tương phản trên cả light lẫn dark.
export const BUBBLE_PRESETS: AppearancePreset[] = [
  { key: "blue", label: "Blue" },
  { key: "teal", label: "Teal" },
  { key: "violet", label: "Violet" },
  { key: "amber", label: "Amber" },
  { key: "rose", label: "Rose" },
];

// Theme sự kiện: 1 lựa chọn đổi CẢ hình nền + màu bong bóng (dùng chung 1 key cho
// cả hai — chọn theme = setAppearance({wallpaper: key, bubbleColor: key})).
// Vẫn đi qua đúng 2 field wallpaper/bubbleColor sẵn có → không cần thay đổi BE.
export const EVENT_THEME_PRESETS: AppearancePreset[] = [
  { key: "noel", label: "Noel" },
  { key: "halloween", label: "Halloween" },
  { key: "valentine", label: "Valentine" },
];

const eventThemeKeys = EVENT_THEME_PRESETS.map((p) => p.key);
const wallpaperKeys = new Set(
  WALLPAPER_PRESETS.map((p) => p.key).concat(eventThemeKeys),
);
const bubbleKeys = new Set(
  BUBBLE_PRESETS.map((p) => p.key).concat(eventThemeKeys),
);

/** Key hợp lệ → class CSS; key lạ/null (BE chỉ giới hạn độ dài) → "" = mặc định. */
export const getWallpaperClass = (key?: string | null): string =>
  key && wallpaperKeys.has(key) ? `chat-wp-${key}` : "";

// `chat-bubble-custom` đi kèm mọi preset: chứa các override contrast dùng chung
// (chữ trắng + đổi màu các text vốn có màu riêng — mention, reply/forward header,
// View more — để vẫn đọc rõ trên nền bão hòa).
export const getBubbleClass = (key?: string | null): string =>
  key && bubbleKeys.has(key) ? `chat-bubble-custom chat-bubble-${key}` : "";
