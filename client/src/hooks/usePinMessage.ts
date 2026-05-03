import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useInfo from "./useInfo";
import { pinMessage } from "../services/message.service";
import { MessageCache } from "../types/message.types";

export const usePinMessage = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const [pinning, setPinning] = useState(false);

  const pin = async (messageId: string, currentlyPinned: boolean) => {
    // Guard: cả hai id đều bắt buộc để gọi API
    if (!conversationId || !messageId) return;

    setPinning(true);
    // Toggle pin state: nếu đang pinned → unpin, và ngược lại
    await pinMessage({ conversationId, messageId, pinned: !currentlyPinned });

    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => ({
        ...oldData,
        messages: (oldData.messages ?? []).map((msg) =>
          msg.id !== messageId
            ? msg
            // Cập nhật trạng thái pin ngược lại + ghi lại id người ghim
            : { ...msg, isPinned: !currentlyPinned, pinnedBy: info?.id },
        ),
      }),
    );
    setPinning(false);
  };

  return { pin, pinning };
};
