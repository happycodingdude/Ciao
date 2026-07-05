import { useQueryClient } from "@tanstack/react-query";
import { closePoll, votePoll } from "../services/message.service";
import { PollModel } from "../types/message.types";
import { updateMessageById } from "../utils/messageCache";
import useInfo from "./useInfo";

// Bỏ phiếu / đóng bình chọn với cập nhật optimistic. BE persist atomic (chống mất phiếu
// khi vote đồng thời) → cập nhật Redis cache (reload giữ phiếu) → fanout realtime "PollUpdated"
// để các máy khác đồng bộ voterIds/đóng ngay (onPollUpdated ghi đè state authoritative).
export const usePoll = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const userId = info?.id ?? "";

  const vote = (messageId: string, optionKey: string, poll: PollModel) => {
    if (poll.closedTime) return; // poll đã đóng → không cho vote

    // Optimistic: phản chiếu đúng logic BE (chọn nhiều = toggle; chọn một = độc quyền).
    updateMessageById(queryClient, conversationId, messageId, (m) => {
      if (!m.poll) return m;
      const options = m.poll.options.map((o) => {
        const has = o.voterIds.includes(userId);
        if (poll.allowMultiple) {
          if (o.key !== optionKey) return o;
          return {
            ...o,
            voterIds: has ? o.voterIds.filter((v) => v !== userId) : [...o.voterIds, userId],
          };
        }
        // Chọn một: gỡ khỏi mọi option rồi thêm vào option được chọn.
        const withoutMe = o.voterIds.filter((v) => v !== userId);
        return o.key === optionKey ? { ...o, voterIds: [...withoutMe, userId] } : { ...o, voterIds: withoutMe };
      });
      return { ...m, poll: { ...m.poll, options } };
    });

    votePoll(conversationId, messageId, optionKey, poll.allowMultiple).catch((err) =>
      console.error("votePoll failed", err),
    );
  };

  const close = (messageId: string) => {
    updateMessageById(queryClient, conversationId, messageId, (m) =>
      m.poll
        ? { ...m, poll: { ...m.poll, closedTime: new Date().toISOString(), closedBy: userId } }
        : m,
    );
    closePoll(conversationId, messageId).catch((err) => console.error("closePoll failed", err));
  };

  return { vote, close, userId };
};
