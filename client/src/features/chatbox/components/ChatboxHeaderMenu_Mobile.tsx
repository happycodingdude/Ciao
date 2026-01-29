import { InfoCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useSignal } from "../../../context/SignalContext";
import useChatDetailToggles from "../../../hooks/useChatDetailToggles";
import useConversation from "../../../hooks/useConversation";
import useInfo from "../../../hooks/useInfo";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { UserProfile } from "../../../types";

const ChatboxHeaderMenu_Mobile = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  // if (!conversations || !conversation) return;
  const [conversationId] = useLocalStorage<string>("conversationId");
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const { data: info } = useInfo();
  const { startLocalStream } = useSignal();

  return (
    <>
      {/* MARK: VIDEO CALL  */}
      <VideoCameraOutlined
        onClick={() =>
          startLocalStream(
            conversation?.members.find((mem) => mem.contact.id !== info.id)
              .contact as UserProfile,
          )
        }
        className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
      />
      {/* MARK: INFO  */}
      <div
        className={`flex justify-end gap-[1rem] rounded-full 
            ${toggle === "information" ? "text-[var(--main-color-bold)] hover:text-[var(--main-color)]" : "hover:text-[var(--main-color-bold)]"}`}
      >
        <InfoCircleOutlined
          onClick={() =>
            setToggle((current) =>
              current === "information" ? null : "information",
            )
          }
          className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
        />
      </div>
    </>
  );
};

export default ChatboxHeaderMenu_Mobile;
