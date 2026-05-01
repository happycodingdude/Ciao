import useConversation from "../../hooks/useConversation";
import LocalLoading from "../common/LocalLoading";
import ListChatFilter from "./ListChatFilter";
import ListchatContent from "./ListchatContent";

const ListChat = () => {
  const { isLoading, isRefetching } = useConversation();

  return (
    <div className="relative grow">
      <ListChatFilter />
      {(isLoading || isRefetching) ? <LocalLoading /> : null}
      <ListchatContent />
    </div>
  );
};

export default ListChat;
