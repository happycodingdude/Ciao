import { InfoCircleOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import React, { useEffect, useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import { useSignal } from "../../../context/SignalContext";
import useInfo from "../../authentication/hooks/useInfo";
import AttachmentIcon from "../../chatdetail/components/AttachmentIcon";
import useConversation from "../../listchat/hooks/useConversation";
import VideoCall, { PositionProps } from "../../videocall/VideoCall";
import useChatDetailToggles from "../hooks/useChatDetailToggles";
import AddMembers from "./AddMembers";
import UpdateConversation from "./UpdateConversation";

const ChatboxHeader = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  const { data: info } = useInfo();
  const { isCaller, startLocalStream } = useSignal();

  const [openUpdateTitle, setOpenUpdateTitle] = useState<boolean>(false);
  const [position, setPosition] = useState<PositionProps>({ x: 0, y: 0 });
  // Center the modal when it first renders
  useEffect(() => {
    // const centerX = window.innerWidth / 4 - 200; // Adjust based on modal width
    const centerY = window.innerHeight / 2 - 300; // Adjust based on modal height
    setPosition({
      x: (window.innerWidth * 2) / 3,
      y: centerY,
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    // console.log(event);
    if (event.delta) {
      setPosition((prev) => ({
        x: prev.x + event.delta.x,
        y: prev.y + event.delta.y,
      }));
    }
  };

  return (
    <div
      className="flex w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] px-[1rem] 
    py-[.5rem] text-[var(--text-main-color-normal)] phone:h-[7rem] laptop:h-[6rem]"
    >
      <div className="relative flex items-center gap-[1rem]">
        {/* MARK: AVATAR  */}
        <ImageWithLightBoxAndNoLazy
          src={
            conversations.selected.isGroup
              ? conversations.selected.avatar
              : conversations.selected.members?.find(
                  (item) => item.contact.id !== info.id,
                )?.contact.avatar
          }
          slides={[
            {
              src: conversations.selected.isGroup
                ? conversations.selected.avatar
                : conversations.selected.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.avatar,
            },
          ]}
          className="loaded relative aspect-square w-[4rem] cursor-pointer"
          circle
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
        {/* MARK: TITLE  */}
        <div className="relative flex grow flex-col text-md phone:max-w-[12rem] laptop:max-w-[30rem] desktop:max-w-[50rem]">
          {conversations.selected.isGroup ? (
            <>
              <div className="flex w-full gap-[.5rem]">
                <CustomLabel
                  className="font-bold"
                  title={conversations.selected.title}
                />
              </div>
              <p className="text-sm">
                {conversations.selected.members.length} members
              </p>
            </>
          ) : (
            <>
              <CustomLabel
                className="font-bold"
                title={
                  conversations.selected.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.name
                }
              />
            </>
          )}
        </div>
      </div>
      <div className="flex phone:gap-[1.5rem] laptop:gap-[2rem]">
        {/* MARK: ADD MEMBERS, UPDATE CONVERSATION  */}
        {conversations.selected.isGroup ? (
          <>
            <AddMembers />
            <i
              className="fa-light fa-pen-to-square flex cursor-pointer items-center justify-center text-base font-medium hover:text-[var(--main-color-bold)]"
              onClick={() => {
                if (conversations.selected.isGroup) setOpenUpdateTitle(true);
              }}
            ></i>
          </>
        ) : (
          ""
        )}
        {/* MARK: VIDEO CALL  */}
        <VideoCameraOutlined
          onClick={() => startLocalStream()}
          className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
        />
        {isCaller ? (
          <DndContext onDragEnd={handleDragEnd}>
            <VideoCall
              contact={
                conversations.selected?.members.find(
                  (mem) => mem.contact.id !== info.id,
                ).contact
              }
              position={position}
            />
          </DndContext>
        ) : (
          ""
        )}
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
      </div>
    </div>
  );
};

export default ChatboxHeader;
