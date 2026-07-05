import { usePoll } from "../../hooks/usePoll";
import { PendingMessageModel } from "../../types/message.types";

// Render tin nhắn bình chọn: câu hỏi + các lựa chọn với thanh tỷ lệ, cho bỏ phiếu,
// người tạo có thể đóng bình chọn.
const PollMessage = ({
  message,
  conversationId,
}: {
  message: PendingMessageModel;
  conversationId: string;
}) => {
  const { vote, close, userId } = usePoll(conversationId);
  const poll = message.poll;
  if (!poll) return null;

  const closed = !!poll.closedTime;
  const isCreator = message.contactId === userId;
  const totalVotes = poll.options.reduce((sum, o) => sum + (o.voterIds?.length ?? 0), 0);

  return (
    <div className="laptop:w-72 flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--bubble-bg) p-4 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-(--text-main-color)">{poll.question}</p>
      </div>
      <p className="text-2xs text-(--text-main-color-blur)">
        {poll.allowMultiple ? "Chọn một hoặc nhiều · " : "Chọn một · "}
        {closed ? "Đã đóng" : "Đang mở"}
      </p>

      <div className="flex flex-col gap-2">
        {poll.options.map((o) => {
          const count = o.voterIds?.length ?? 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const voted = o.voterIds?.includes(userId);
          return (
            <button
              key={o.key}
              type="button"
              disabled={closed}
              onClick={() => vote(message.id ?? "", o.key, poll)}
              className={`relative overflow-hidden rounded-xl border px-3 py-2 text-left transition-colors
                ${voted ? "border-light-blue-500" : "border-(--modal-border-color)"}
                ${closed ? "cursor-default" : "cursor-pointer hover:border-light-blue-400"}`}
            >
              {/* Thanh tỷ lệ nền */}
              <span
                className="absolute inset-y-0 left-0 bg-light-blue-500/15"
                style={{ width: `${percent}%` }}
              />
              <span className="relative flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 truncate">
                  {voted && <i className="fa fa-check text-light-blue-500" />}
                  <span className="truncate text-(--text-main-color)">{o.text}</span>
                </span>
                <span className="text-2xs shrink-0 text-(--text-main-color-blur)">
                  {count} · {percent}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-2xs flex items-center justify-between text-(--text-main-color-blur)">
        <span>{totalVotes} lượt bình chọn</span>
        {isCreator && !closed && (
          <button
            type="button"
            onClick={() => close(message.id ?? "")}
            className="cursor-pointer font-medium text-red-500 hover:underline"
          >
            Đóng bình chọn
          </button>
        )}
      </div>
    </div>
  );
};

export default PollMessage;
