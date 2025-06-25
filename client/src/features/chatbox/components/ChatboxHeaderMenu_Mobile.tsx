import { InfoCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";
import React from "react";
import { useSignal } from "../../../context/SignalContext";
import { UserProfile } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import useConversation from "../../listchat/hooks/useConversation";
import useChatDetailToggles from "../hooks/useChatDetailToggles";

const ChatboxHeaderMenu_Mobile = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  const { data: info } = useInfo();
  const { startLocalStream } = useSignal();

  return (
    <>
      {/* MARK: VIDEO CALL  */}
      <VideoCameraOutlined
        onClick={() =>
          startLocalStream(
            conversations.selected?.members.find(
              (mem) => mem.contact.id !== info.id,
            ).contact as UserProfile,
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
