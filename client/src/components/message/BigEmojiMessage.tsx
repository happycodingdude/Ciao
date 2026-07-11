import "../../styles/emojiMessage.css";
import { getEmojiAnimation } from "../../utils/emoji";

/**
 * Phase 4 — Đợt 1: tin nhắn CHỈ chứa emoji (trong ngưỡng) → hiển thị cỡ lớn,
 * KHÔNG bọc bong bóng (tương tự sticker). Emoji thuộc tập hỗ trợ sẽ có
 * chuyển động nhẹ vài nhịp rồi dừng; hệ thống bật "giảm chuyển động" →
 * CSS tự hạ về emoji tĩnh.
 */
const BigEmojiMessage = ({ emojis }: { emojis: string[] }) => (
  <div className="big-emoji" data-count={emojis.length}>
    {emojis.map((emoji, idx) => {
      const anim = getEmojiAnimation(emoji);
      return (
        <span
          // Nội dung tin là bất biến (edit tạo content mới) → index ổn định.
          key={`${emoji}-${idx}`}
          className={anim ? `emoji-anim emoji-anim-${anim}` : undefined}
        >
          {emoji}
        </span>
      );
    })}
  </div>
);

export default BigEmojiMessage;
