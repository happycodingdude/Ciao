import { InfoCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useInfo from "../../authentication/hooks/useInfo";
import AttachmentIcon from "../../chatdetail/components/AttachmentIcon";
import useConversation from "../../listchat/hooks/useConversation";
import useChatDetailToggles from "../hooks/useChatDetailToggles";
import AddMembers from "./AddMembers";
import UpdateConversation from "./UpdateConversation";

const ChatboxHeader = () => {
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  const { data: info } = useInfo();

  const [openUpdateTitle, setOpenUpdateTitle] = useState<boolean>(false);

  return (
    <div
      className="flex w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] px-[1rem] 
    py-[.5rem] text-[var(--text-main-color-normal)] phone:h-[5rem] laptop:h-[6rem]"
    >
      <div className="relative flex items-center gap-[1rem]">
        {/* Avatar */}
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
          className="loaded relative aspect-square cursor-pointer phone:w-[3.5rem] laptop:w-[4rem]"
          circle
        />
        <BackgroundPortal
          show={openUpdateTitle}
          className="laptop:!w-[45rem] desktop:!w-[35%]"
          title="Update group"
          onClose={() => setOpenUpdateTitle(false)}
        >
          <UpdateConversation
            selected={conversations.selected}
            onClose={() => setOpenUpdateTitle(false)}
          />
        </BackgroundPortal>

        {/* Title */}
        <div className="relative flex grow flex-col text-md phone:max-w-[20rem] laptop:max-w-[30rem] desktop:max-w-[50rem]">
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
      {/* Functionality */}
      <div className="flex gap-[2rem]">
        {conversations.selected.isGroup ? (
          <>
            <AddMembers />{" "}
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
