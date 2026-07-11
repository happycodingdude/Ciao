import { summarizeReactions } from "../../packs/reactionPack";
import "../../styles/reaction.css";
import { PendingMessageModel } from "../../types/message.types";

type Props = {
  message: PendingMessageModel;
  mine: boolean;
};

// Chip tổng reaction trên tin: top 3 loại (icon tĩnh) + tổng số, neo góc dưới-trong
// của bubble (mine: trái — né icon trạng thái; người khác: phải). Pop animation khi
// số lượng đổi (remount theo key). Nút THẢ reaction nằm trong menu hover của tin
// (MessageMenu_Slide) — component này chỉ hiển thị kết quả.
const MessageReaction = ({ message, mine }: Props) => {
  const { total, top } = summarizeReactions(message);
  if (total === 0) return null;

  return (
    <div
      key={total}
      className="reaction-chip"
      data-mine={mine}
      title={top.map((def) => def.label).join(", ")}
    >
      {top.map((def) => (
        <img key={def.key} src={def.staticSrc} alt={def.emoji} />
      ))}
      <span>{total}</span>
    </div>
  );
};

export default MessageReaction;
