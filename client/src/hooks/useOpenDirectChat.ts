import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { createDirectChat } from "../services/friend.service";
import { ConversationCache } from "../types/conv.types";
import { ContactModel } from "../types/friend.types";
import {
  buildOptimisticConversation,
  prependConversation,
} from "../utils/conversationCache";
import useInfo from "./useInfo";
import useLoading from "./useLoading";

// Mở direct chat với 1 contact từ các điểm vào "1 phát" (dashboard online friends,
// nút Chat ở Connections...). Khác FriendCtaButton (trang Chats, set `selected`).
//
// FIX race: BE `CreateDirectConversation` KHÔNG persist đồng bộ — nó đẩy Kafka để
// consumer lưu Mongo BẤT ĐỒNG BỘ rồi trả `conversationId` ngay. Vì vậy gọi
// getConversations ngay sau đó (qua invalidate) có thể CHƯA thấy hội thoại mới →
// ChatboxContainer/Header (đọc conversation từ cache list theo id) không tìm thấy →
// "không thấy hội thoại". Cách cũ `invalidateQueries` vừa race vừa có thể GHI ĐÈ mất
// hội thoại mới. Cách đúng (giống FriendCtaButton): chèn OPTIMISTIC vào cache theo id
// THẬT trả về → hiển thị ngay, không phụ thuộc thời điểm consumer lưu xong; refetch tự
// nhiên về sau (staleTime) sẽ reconcile theo id.
export function useOpenDirectChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { setLoading } = useLoading();

  // Chặn double-click khi đang tạo direct chat cho một contact cụ thể.
  const [openingId, setOpeningId] = useState<string | null>(null);

  const goToConversation = (conversationId: string) =>
    router.navigate({
      to: "/conversations/$conversationId",
      params: { conversationId },
    });

  const openChat = async (contact: ContactModel) => {
    if (openingId) return;

    // Đã có direct conversation → điều hướng thẳng, không gọi API.
    if (contact.directConversation) {
      goToConversation(contact.directConversation);
      return;
    }

    if (!contact.id) return;

    try {
      setOpeningId(contact.id);
      setLoading(true);
      const res = await createDirectChat(contact.id);
      const conversationId = res?.conversationId;
      if (!conversationId) return;

      // Chèn optimistic theo id thật. Chỉ chèn khi CHƯA có để không clobber entry đã
      // đầy đủ data (lastMessage...) nếu hội thoại vốn đã tồn tại.
      if (info) {
        queryClient.setQueryData<ConversationCache>(["conversation"], (old) => {
          if ((old?.conversations ?? []).some((c) => c.id === conversationId))
            return old;
          return prependConversation(
            old ?? { conversations: [], filterConversations: [] },
            buildOptimisticConversation(conversationId, info, contact),
          );
        });
      }

      goToConversation(conversationId);
    } finally {
      setOpeningId(null);
      setLoading(false);
    }
  };

  return { openChat, openingId };
}

export default useOpenDirectChat;
