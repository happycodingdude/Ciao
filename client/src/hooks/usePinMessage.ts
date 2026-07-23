import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useInfo from "./useInfo";
import {
  getConversationPinnedIds,
  pinMessage,
} from "../services/message.service";
import { PinnedIdItem } from "../types/message.types";

// Ghim tin (DÙNG CHUNG cho hội thoại): trạng thái ghim của các tin + toggle. Đối xứng useBookmark.
// Sau khi tách pin khỏi message sub-doc, trạng thái ghim inline lấy từ cache riêng:
// ["pinnedIds", conversationId] = PinnedIdItem[] (messageId + pinnedBy). Fetch EAGER khi vào hội
// thoại; react-query dedupe nên toàn hội thoại chỉ tốn 1 request dù hook mount theo từng message.
export const usePinMessage = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const [pinning, setPinning] = useState(false);

  const { data: pinnedIds } = useQuery({
    queryKey: ["pinnedIds", conversationId],
    queryFn: () => getConversationPinnedIds(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });

  const isPinned = (messageId: string | undefined) =>
    !!messageId && (pinnedIds ?? []).some((p) => p.messageId === messageId);

  // Tên/tooltip "pinned by" resolve ở component từ members; đây trả về id người ghim.
  const pinnedBy = (messageId: string | undefined) =>
    messageId
      ? ((pinnedIds ?? []).find((p) => p.messageId === messageId)?.pinnedBy ??
        undefined)
      : undefined;

  const pin = async (messageId: string, currentlyPinned: boolean) => {
    if (!conversationId || !messageId || pinning) return;
    setPinning(true);
    try {
      await pinMessage({ conversationId, messageId, pinned: !currentlyPinned });
      // Optimistic: cập nhật cache pinnedIds ngay (badge inline + nút menu phản hồi tức thì).
      queryClient.setQueryData<PinnedIdItem[]>(
        ["pinnedIds", conversationId],
        (old) =>
          currentlyPinned
            ? (old ?? []).filter((p) => p.messageId !== messageId)
            : [...(old ?? []), { messageId, pinnedBy: info?.id }],
      );
      // Panel "Tin đã ghim" (nếu đang mở) refetch để list khớp thao tác vừa làm.
      queryClient.invalidateQueries({
        queryKey: ["pinnedMessages", conversationId],
      });
    } finally {
      setPinning(false);
    }
  };

  return { isPinned, pinnedBy, pin, pinning };
};
