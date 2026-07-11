import useConversation from "../../hooks/useConversation";
import useConversationAppearance from "../../hooks/useConversationAppearance";
import useInfo from "../../hooks/useInfo";
import "../../styles/chatAppearance.css";
import {
  BUBBLE_PRESETS,
  EVENT_THEME_PRESETS,
  WALLPAPER_PRESETS,
  getBubbleClass,
  getWallpaperClass,
} from "../../utils/chatAppearance";

type Props = {
  conversationId: string;
};

// TẠM ẨN 2 hàng chọn riêng lẻ Chat wallpaper + Bubble color (theo yêu cầu user
// 2026-07-11): trước mắt chỉ dùng Themes (đổi cả nền + bong bóng cùng lúc).
// GIỮ NGUYÊN code/preset để bật lại khi cần — chỉ cần đổi flag này thành true.
const SHOW_INDIVIDUAL_ROWS = false;

// Phase 3 — Đợt 3 (rev 2): section "Customize chat" trong panel Information.
// Chọn preset hình nền + màu bong bóng CHUNG cho cả hội thoại — mọi thành viên
// đều thấy (sync realtime); ô đầu tiên = Default (null). Swatch render bằng chính
// class preset → luôn khớp 100% với màu áp lên chat và tự đổi theo light/dark.
const InformationAppearance = ({ conversationId }: Props) => {
  const { wallpaper, bubbleColor, setAppearance, saving } =
    useConversationAppearance(conversationId);
  const { data: conversations } = useConversation();
  const { data: info } = useInfo();

  // Quyền đổi theme: nhóm → chỉ trưởng nhóm (isModerator); chat 1-1 không có
  // trưởng nhóm nên cả hai phía đều đổi được. Thành viên thường KHÔNG thấy section
  // này (ẩn hẳn, không render dạng khóa). BE cũng enforce — đây chỉ là lớp UI.
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );
  const selfMember = conversation?.members?.find(
    (m) => m.contact?.id === info?.id,
  );
  const canEdit = !conversation?.isGroup || !!selfMember?.isModerator;

  const swatchRing = (selected: boolean) =>
    selected
      ? "ring-2 ring-light-blue-500 ring-offset-2 ring-offset-(--bg-color)"
      : "ring-1 ring-(--border-color)";

  if (!canEdit) return null;

  return (
    <div className={`flex flex-col gap-3 ${saving ? "opacity-60" : ""}`}>
      <div>
        <p className="font-medium">Customize chat</p>
        <p className="text-2xs text-(--text-main-color-blur)">
          Áp dụng cho mọi thành viên trong đoạn chat
        </p>
      </div>

      {/* Theme sự kiện: 1 ô đổi CẢ wallpaper + bubble (cùng key). Swatch = nền gradient
          của theme + chấm tròn màu bubble ở giữa để thấy trước cả hai. Ô Default
          (cần thiết khi 2 hàng riêng lẻ đang ẩn — là lối duy nhất về mặc định). */}
      <div className="flex flex-col gap-2">
        <p className="text-2xs text-(--text-main-color-blur)">Themes</p>
        <div className="flex flex-wrap gap-3">
          {[{ key: null as string | null, label: "Default" }]
            .concat(EVENT_THEME_PRESETS)
            .map((preset) => (
              <div
                key={preset.key ?? "default"}
                title={preset.label}
                onClick={() =>
                  setAppearance({
                    wallpaper: preset.key,
                    bubbleColor: preset.key,
                  })
                }
                className={`${getWallpaperClass(preset.key)} bg-linear-to-br flex h-9 w-9 cursor-pointer
                  items-center justify-center rounded-lg from-(--chat-bg-from) to-(--chat-bg-to)
                  transition-all hover:scale-105
                  ${swatchRing(
                    (wallpaper ?? null) === preset.key &&
                      (bubbleColor ?? null) === preset.key,
                  )}`}
              >
                <div
                  className={`${getBubbleClass(preset.key)} bg-(--bubble-bg) h-4 w-4 rounded-full`}
                />
              </div>
            ))}
        </div>
      </div>

      {SHOW_INDIVIDUAL_ROWS && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-2xs text-(--text-main-color-blur)">
              Chat wallpaper
            </p>
            <div className="flex flex-wrap gap-3">
              {/* Ô Default: không gắn class preset → hiện gradient mặc định của theme */}
              {[{ key: null as string | null, label: "Default" }]
                .concat(WALLPAPER_PRESETS)
                .map((preset) => (
                  <div
                    key={preset.key ?? "default"}
                    title={preset.label}
                    onClick={() => setAppearance({ wallpaper: preset.key })}
                    className={`${getWallpaperClass(preset.key)} bg-linear-to-br h-9 w-9 cursor-pointer rounded-lg
                      from-(--chat-bg-from) to-(--chat-bg-to) transition-all hover:scale-105
                      ${swatchRing((wallpaper ?? null) === preset.key)}`}
                  />
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-2xs text-(--text-main-color-blur)">
              Bubble color
            </p>
            <div className="flex flex-wrap gap-3">
              {[{ key: null as string | null, label: "Default" }]
                .concat(BUBBLE_PRESETS)
                .map((preset) => (
                  <div
                    key={preset.key ?? "default"}
                    title={preset.label}
                    onClick={() => setAppearance({ bubbleColor: preset.key })}
                    className={`${getBubbleClass(preset.key)} bg-(--bubble-bg) h-8 w-8 cursor-pointer rounded-full
                      transition-all hover:scale-105
                      ${swatchRing((bubbleColor ?? null) === preset.key)}`}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InformationAppearance;
