import { InfoCircleOutlined, SearchOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useSignal } from "../../context/SignalContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import useLocalStorage from "../../hooks/useLocalStorage";
import { UserProfile } from "../../types/base.types";

const ChatboxHeaderMenu_Mobile = () => {
  // Mobile chỉ có 2 nút toggle (Search, Info) — VideoCamera là action call, không phải UI panel.
  // State mutually exclusive → active = showX, không cần derive priority.
  const { showSearch, showInformation, toggleDetail } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  const [conversationId] = useLocalStorage<string>("conversationId");
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const { data: info } = useInfo();
  const { startLocalStream } = useSignal();

  const otherMember = (conversation?.members ?? []).find(
    (mem) => mem.contact?.id !== info?.id,
  );

  return (
    <>
      <VideoCameraOutlined
        onClick={() => {
          if (otherMember?.contact) {
            startLocalStream(otherMember.contact as UserProfile);
          }
        }}
        className="base-icon-sm transition-all duration-200 hover:text-(--main-color-bold)"
      />
      <SearchOutlined
        onClick={() => toggleDetail("search")}
        className={`base-icon-sm transition-all duration-200
          ${showSearch ? "text-(--main-color-bold)" : "hover:text-(--main-color-bold)"}`}
      />
      <div
        className={`flex justify-end gap-4 rounded-full
            ${
              showInformation
                ? "text-(--main-color-bold) hover:text-(--main-color)"
                : "hover:text-(--main-color-bold)"
            }`}
      >
        <InfoCircleOutlined
          onClick={() => toggleDetail("information")}
          className="base-icon-sm transition-all duration-200 hover:text-(--main-color-bold)"
        />
      </div>
    </>
  );
};

export default ChatboxHeaderMenu_Mobile;
