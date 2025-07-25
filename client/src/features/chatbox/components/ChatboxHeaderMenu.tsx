import {
  EditOutlined,
  InfoCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import { useSignal } from "../../../context/SignalContext";
import { UserProfile } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import AttachmentIcon from "../../chatdetail/components/AttachmentIcon";
import useConversation from "../../listchat/hooks/useConversation";
import useChatDetailToggles from "../hooks/useChatDetailToggles";
import AddMembers from "./AddMembers";
import UpdateConversation from "./UpdateConversation";

const ChatboxHeaderMenu = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  const { data: info } = useInfo();
  const { startLocalStream } = useSignal();

  const [openUpdateTitle, setOpenUpdateTitle] = useState<boolean>(false);

  return (
    <>
      {/* MARK: ADD MEMBERS, UPDATE CONVERSATION  */}
      {conversations.selected.isGroup ? (
        <>
          <AddMembers />
          <EditOutlined
            className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
            onClick={() => {
              if (conversations.selected.isGroup) setOpenUpdateTitle(true);
            }}
          />
          <BackgroundPortal
            show={openUpdateTitle}
            className="phone:w-[35rem] laptop:w-[45rem] desktop:w-[35%]"
            title="Update group"
            onClose={() => setOpenUpdateTitle(false)}
          >
            <UpdateConversation
              selected={conversations.selected}
              onClose={() => setOpenUpdateTitle(false)}
            />
          </BackgroundPortal>
        </>
      ) : (
        ""
      )}
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
      {/* MARK: ATTACHMENT  */}
      <AttachmentIcon
        onClick={() =>
          setToggle((current) =>
            current === "attachment" ? null : "attachment",
          )
        }
        toggle={toggle === "attachment"}
      />
    </>
  );
};

export default ChatboxHeaderMenu;
