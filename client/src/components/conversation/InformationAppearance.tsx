import useConversation from "../../hooks/useConversation";
import useConversationAppearance from "../../hooks/useConversationAppearance";
import useInfo from "../../hooks/useInfo";
import useLocalStorage from "../../hooks/useLocalStorage";
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
  const [showAppearance, setShowAppearance] = useLocalStorage(
    "showCustomizeChat",
    true,
  );

  // Theme hiện tại: chỉ khớp khi wallpaper + bubbleColor cùng key event-theme
  // (cách duy nhất set qua UI hiện tại). null cả hai = Default; lệch nhau hoặc
  // key lẻ (từ 2 hàng riêng đang ẩn) = Custom.
  const currentTheme =
    EVENT_THEME_PRESETS.find(
      (p) =>
        p.key === (wallpaper ?? null) && p.key === (bubbleColor ?? null),
    ) ?? null;
  const currentThemeLabel =
    currentTheme?.label ??
    ((wallpaper ?? null) === null && (bubbleColor ?? null) === null
      ? "Default"
      : "Custom");

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
      {/* min-h-8 đồng bộ với header mục Members — chiều cao không đổi khi toggle */}
      <div className="min-h-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-medium">Theme</p>
          {/* Thu gọn: tên theme đang set + swatch thu nhỏ (nền theme + chấm bubble)
              NGANG HÀNG cạnh tiêu đề — bấm vào để mở lại phần chọn theme */}
          {!showAppearance && (
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => setShowAppearance(true)}
            >
              <div
                className={`${getWallpaperClass(currentTheme?.key)} bg-linear-to-br flex h-5 w-5 items-center
                  justify-center rounded-full from-(--chat-bg-from) to-(--chat-bg-to) ring-1 ring-(--border-color)`}
              >
                <div
                  className={`${getBubbleClass(currentTheme?.key)} bg-(--bubble-bg) h-2 w-2 rounded-full`}
                />
              </div>
              <p className="text-2xs text-(--text-main-color-blur)">
                {currentThemeLabel}
              </p>
            </div>
          )}
        </div>
        <i
          data-show={showAppearance}
          className="fa-arrow-down fa-solid base-icon-sm flex aspect-square cursor-pointer items-center justify-center
          transition-all duration-500 data-[show=false]:rotate-90"
          onClick={() => setShowAppearance((v) => !v)}
        ></i>
      </div>

      {/* p-1/-m-1: overflow-hidden sẽ cắt ring của swatch (offset 2px + ring 2px
          = 4px lòi ra ngoài) → đệm 4px trong rồi bù margin âm để layout không đổi.
          Khi thu gọn, max-h-0 (border-box) vẫn còn 8px padding dọc — margin âm
          triệt tiêu đúng phần đó.
          max-h khi mở phải SÁT chiều cao nội dung thật: đặt thừa quá nhiều thì
          transition tốn phần lớn thời gian ở vùng không nhìn thấy → hiệu ứng
          trông nhanh/giật, lệch nhịp với mục Members. */}
      <div
        data-show={showAppearance}
        className={`-m-1 flex flex-col gap-3 overflow-hidden p-1 transition-all duration-500 data-[show=false]:max-h-0
          data-[show=false]:opacity-0 data-[show=true]:opacity-100
          ${
            // Bật lại 2 hàng chọn riêng lẻ → nội dung cao hơn nhiều, cần trần lớn hơn
            SHOW_INDIVIDUAL_ROWS
              ? "data-[show=true]:max-h-100"
              : "data-[show=true]:max-h-40"
          }`}
      >
        <p className="text-2xs text-(--text-main-color-blur)">
          Áp dụng cho mọi thành viên trong đoạn chat
        </p>

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
    </div>
  );
};

export default InformationAppearance;
