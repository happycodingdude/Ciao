import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import useLoading from "../../hooks/useLoading";
import { createDirectChat } from "../../services/friend.service";
import { ContactModel } from "../../types/friend.types";
import CustomButton from "../common/CustomButton";

// Nút Chat cho trang Connections: ĐIỀU HƯỚNG sang route hội thoại (khác FriendCtaButton vốn chỉ
// set `selected` trong conversation cache — chỉ hợp ngữ cảnh trang Chats). Cùng pattern HomeOnlineFriends.
const ConnectionChatButton = ({ contact }: { contact: ContactModel }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoading } = useLoading();
  const [opening, setOpening] = useState(false);

  const openChat = async () => {
    if (opening) return;

    // Đã có direct conversation → điều hướng thẳng, không gọi API.
    if (contact.directConversation) {
      router.navigate({
        to: "/conversations/$conversationId",
        params: { conversationId: contact.directConversation },
      });
      return;
    }

    if (!contact.id) return;

    try {
      setOpening(true);
      setLoading(true);
      const res = await createDirectChat(contact.id);
      if (!res?.conversationId) return;
      // Conversation mới chưa có trong cache → invalidate để list/route load đúng.
      await queryClient.invalidateQueries({ queryKey: ["conversation"] });
      router.navigate({
        to: "/conversations/$conversationId",
        params: { conversationId: res.conversationId },
      });
    } finally {
      setOpening(false);
      setLoading(false);
    }
  };

  return (
    <CustomButton
      title="Chat"
      className="text-2xs"
      width={4}
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={openChat}
      processing={opening}
      sm
    />
  );
};

export default ConnectionChatButton;
