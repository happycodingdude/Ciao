import { InfoCircleOutlined } from "@ant-design/icons";
import { useParams } from "@tanstack/react-router";
import useChatDetailToggles from "../../../hooks/useChatDetailToggles";
import useConversation from "../../../hooks/useConversation";
import AttachmentIcon from "../../chatdetail/components/AttachmentIcon";

const ChatboxHeaderMenu = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  // const { data: info } = useInfo();
  // const { startLocalStream } = useSignal();

  // const [openUpdateTitle, setOpenUpdateTitle] = useState<boolean>(false);

  return (
    <>
      {/* MARK: ADD MEMBERS, UPDATE CONVERSATION  */}
      {conversation.isGroup ? (
        <>
          {/* <AddMembers /> */}
          {/* <EditOutlined
            className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
            onClick={() => {
              if (conversation.isGroup) setOpenUpdateTitle(true);
            }}
          />
          <BackgroundPortal
            show={openUpdateTitle}
            className="phone:w-[35rem] laptop:w-[45rem] desktop:w-[35%]"
            title="Update group"
            onClose={() => setOpenUpdateTitle(false)}
          >
            <UpdateConversation
              selected={conversation}
              onClose={() => setOpenUpdateTitle(false)}
            />
          </BackgroundPortal> */}
        </>
      ) : (
        ""
      )}
      {/* MARK: VIDEO CALL  */}
      {/* <VideoCameraOutlined
        onClick={() =>
          startLocalStream(
            conversation.members.find((mem) => mem.contact.id !== info.id)
              .contact as UserProfile,
          )
        }
        className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
      /> */}
      {/* MARK: INFO  */}
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
      {/* MARK: ATTACHMENT  */}
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
