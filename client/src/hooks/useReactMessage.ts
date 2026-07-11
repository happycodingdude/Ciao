import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getReactionDef } from "../packs/reactionPack";
import { reactMessage } from "../services/message.service";
import { PendingMessageModel } from "../types/message.types";
import { updateMessageById } from "../utils/messageCache";

// React / unreact 1 tin nhắn: optimistic (đổi count + currentReaction ngay để user
// thấy phản hồi tức thì), gọi API, lỗi → rollback về snapshot. Event realtime
// NewReaction từ BE mang counts authoritative sẽ reconcile sau
// (notificationHandlers.onNewReaction) nên lệch tạm thời tự khỏi.
const useReactMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  // Khóa theo id tin đang gửi — chặn double-click spam trên cùng 1 tin.
  const [pendingId, setPendingId] = useState<string | null>(null);

  const react = async (message: PendingMessageModel, type: string) => {
    const messageId = message.id;
    if (!messageId || pendingId) return;

    const current = message.currentReaction ?? null;
    // Bấm lại đúng reaction đang chọn = gỡ reaction.
    const isUnReact = current === type;
    const nextType = isUnReact ? null : type;

    const decDef = getReactionDef(current);
    const incDef = getReactionDef(nextType);
    // Snapshot phục vụ rollback (từ props — realtime event sẽ reconcile nếu lệch).
    const snapshot = {
      currentReaction: current,
      dec: decDef ? (message[decDef.countField] ?? 0) : 0,
      inc: incDef ? (message[incDef.countField] ?? 0) : 0,
    };

    setPendingId(messageId);
    updateMessageById(queryClient, conversationId, messageId, (m) => {
      const next: PendingMessageModel = { ...m, currentReaction: nextType };
      if (decDef)
        next[decDef.countField] = Math.max(0, (m[decDef.countField] ?? 0) - 1);
      if (incDef) next[incDef.countField] = (m[incDef.countField] ?? 0) + 1;
      return next;
    });

    try {
      await reactMessage({ conversationId, messageId, type, isUnReact });
    } catch (err) {
      console.error("Failed to react message: ", err);
      updateMessageById(queryClient, conversationId, messageId, (m) => {
        const next: PendingMessageModel = {
          ...m,
          currentReaction: snapshot.currentReaction,
        };
        if (decDef) next[decDef.countField] = snapshot.dec;
        if (incDef) next[incDef.countField] = snapshot.inc;
        return next;
      });
    } finally {
      setPendingId(null);
    }
  };

  return { react, pendingId };
};

export default useReactMessage;
