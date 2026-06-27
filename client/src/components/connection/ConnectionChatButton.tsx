import useOpenDirectChat from "../../hooks/useOpenDirectChat";
import { ContactModel } from "../../types/friend.types";
import CustomButton from "../common/CustomButton";

// Nút Chat cho trang Connections: ĐIỀU HƯỚNG sang route hội thoại (khác FriendCtaButton vốn chỉ
// set `selected` trong conversation cache — chỉ hợp ngữ cảnh trang Chats). Cùng pattern HomeOnlineFriends.
const ConnectionChatButton = ({ contact }: { contact: ContactModel }) => {
  // openChat: tạo (nếu cần) + chèn optimistic + điều hướng — fix race persist Kafka ở BE.
  const { openChat, openingId } = useOpenDirectChat();

  return (
    <CustomButton
      title="Chat"
      className="text-2xs"
      width={4}
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={() => openChat(contact)}
      processing={openingId === contact.id}
      sm
    />
  );
};

export default ConnectionChatButton;
