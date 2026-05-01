import { InfoCircleOutlined } from "@ant-design/icons";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import AttachmentIcon from "./AttachmentIcon";

const ChatboxHeaderMenu = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();

  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  return (
    <>
      {conversation?.isGroup ? (
        <>
        </>
      ) : (
        ""
      )}
      <div
        className={`flex justify-end gap-4 rounded-full
            ${
              toggle === "information"
                ? "text-light-blue-500"
                : "hover:text-light-blue-500"
            }`}
      >
        <InfoCircleOutlined
          onClick={() =>
            setToggle((current) =>
              current === "information" ? null : "information",
            )
          }
          className="base-icon transition-all duration-200"
        />
      </div>
      <AttachmentIcon
        onClick={() =>
          setToggle((current) =>
            current === "attachment" ? null : "attachment",
          )
        }
        toggle={toggle === "attachment"}
        width="1.25rem"
        height="1.25rem"
      />
    </>
  );
};

export default ChatboxHeaderMenu;
