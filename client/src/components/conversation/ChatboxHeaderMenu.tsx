import {
  BookOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import AttachmentIcon from "./AttachmentIcon";

const ChatboxHeaderMenu = () => {
  // Click icon = toggleDetail(kind). State mutually exclusive → active = showX trực tiếp,
  // không còn priority hack nào nữa, icon luôn khớp với panel đang hiển thị.
  const {
    showSearch,
    showInformation,
    showAttachment,
    showBookmark,
    toggleDetail,
  } = useChatDetailToggles();

  const { data: conversations } = useConversation();

  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  return (
    <>
      {conversation?.isGroup ? <></> : ""}
      <div
        className={`flex justify-end gap-4 rounded-full
            ${showSearch ? "text-light-blue-500" : "hover:text-light-blue-500"}`}
      >
        <SearchOutlined
          onClick={() => toggleDetail("search")}
          className="base-icon transition-all duration-200"
        />
      </div>
      {/* Xem lại tin đã lưu trong hội thoại — icon Book đồng bộ với action "Lưu tin nhắn". */}
      <div
        className={`flex justify-end gap-4 rounded-full
            ${showBookmark ? "text-light-blue-500" : "hover:text-light-blue-500"}`}
      >
        <BookOutlined
          onClick={() => toggleDetail("bookmark")}
          className="base-icon transition-all duration-200"
        />
      </div>
      <div
        className={`flex justify-end gap-4 rounded-full
            ${showInformation ? "text-light-blue-500" : "hover:text-light-blue-500"}`}
      >
        <InfoCircleOutlined
          onClick={() => toggleDetail("information")}
          className="base-icon transition-all duration-200"
        />
      </div>
      <AttachmentIcon
        onClick={() => toggleDetail("attachment")}
        toggle={showAttachment}
        width="1.25rem"
        height="1.25rem"
      />
    </>
  );
};

export default ChatboxHeaderMenu;
