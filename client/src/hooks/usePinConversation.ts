import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pinConversation } from "../services/conv.service";
import { ConversationCache } from "../types/conv.types";
import { updateConversationMember } from "../utils/conversationCache";
import useInfo from "./useInfo";

// Favorites (per-user, trước đây là "ghim hội thoại"): lưu pinnedTime trên member của
// chính mình. ListChatContainer đọc pinnedTime để tách vùng Favorites trên đầu danh sách.
export const usePinConversation = () => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const [pinning, setPinning] = useState(false);

  const togglePin = async (conversationId: string, currentlyPinned: boolean) => {
    if (!conversationId || !info?.id || pinning) return;
    setPinning(true);
    try {
      await pinConversation(conversationId, !currentlyPinned);
      queryClient.setQueryData<ConversationCache>(["conversation"], (old) =>
        old
          ? updateConversationMember(old, conversationId, info.id!, (m) => ({
              ...m,
              pinnedTime: currentlyPinned ? null : new Date().toISOString(),
            }))
          : old,
      );
    } finally {
      setPinning(false);
    }
  };

  return { togglePin, pinning };
};
