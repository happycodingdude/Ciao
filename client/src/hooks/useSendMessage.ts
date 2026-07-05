import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { SendMessageRequest } from "../types/message.types";
import { getResendParam } from "../utils/failedMessageStore";
import { sendMessageFlow } from "../utils/sendMessageFlow";
import useInfo from "./useInfo";
import { useReply } from "./useReply";

// Re-export để các luồng khác (vd useDirectMessage) dùng chung mức timeout.
export { SEND_REQUEST_TIMEOUT_MS } from "../utils/sendMessageFlow";

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { reply, clearReply } = useReply();

  const { mutate: send } = useMutation({
    mutationFn: async (param: SendMessageRequest) =>
      sendMessageFlow({ queryClient, conversationId, info, clearReply }, param, reply),
  });

  const retry = useRetryMessage(conversationId);

  return { send, retry };
};

// Hook nhẹ chỉ expose retry (không tạo mutation) — dùng ở cấp từng tin nhắn
// (MessageContent) để tránh khởi tạo useMutation thừa cho mỗi message.
//
// Gửi lại LUÔN do người dùng bấm (không tự động). Lấy nội dung/tệp/reply từ store tin lỗi:
// - Còn File trong RAM (chưa reload) → gửi lại đầy đủ, kể cả media.
// - Sau reload: tin text tái tạo được; tin có tệp báo người dùng đính kèm lại (File đã mất).
export const useRetryMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { clearReply } = useReply();

  return useCallback(
    (id: string) => {
      const resolved = getResendParam(conversationId, id);
      if (!resolved.ok) {
        if (resolved.needsReattach) {
          toast.error(
            "Không thể gửi lại tệp sau khi tải lại trang. Vui lòng đính kèm và gửi lại.",
          );
        }
        return;
      }
      sendMessageFlow(
        { queryClient, conversationId, info, clearReply },
        resolved.param,
        resolved.reply,
        id,
      );
    },
    [conversationId, queryClient, info, clearReply],
  );
};
