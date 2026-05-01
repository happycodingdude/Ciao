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
    if (!conversationId || !messageId) return;
    setPinning(true);
    await pinMessage({ conversationId, messageId, pinned: !currentlyPinned });
    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => ({
        ...oldData,
        messages: (oldData.messages ?? []).map((msg) =>
          msg.id !== messageId
            ? msg
            : { ...msg, isPinned: !currentlyPinned, pinnedBy: info?.id },
        ),
      }),
    );
    setPinning(false);
  };

  return { pin, pinning };
};
