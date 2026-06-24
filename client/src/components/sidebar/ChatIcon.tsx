import useUnseenConversationCount from "../../hooks/useUnseenConversationCount";
import UnseenBadge from "./UnseenBadge";

const ChatIcon = ({ onClick }: { onClick?: () => void }) => {
  const unseenCount = useUnseenConversationCount();
  return (
    <div className="relative inline-flex" onClick={onClick}>
      <div className={`fa fa-comment base-icon`}></div>
      <UnseenBadge count={unseenCount} />
    </div>
  );
};

export default ChatIcon;
