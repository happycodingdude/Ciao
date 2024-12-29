import { InfoCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useConversation from "../../../hooks/useConversation";
import useInfo from "../../../hooks/useInfo";
import AddMembers from "./AddMembers";
import AttachmentIcon from "./AttachmentIcon";
import UpdateConversation from "./UpdateConversation";

const ChatboxHeader = (props) => {
  console.log("ChatboxHeader calling");
  const { setToggle, toggle } = props;

  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  const { data: info } = useInfo();

  const [openUpdateTitle, setOpenUpdateTitle] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  return (
    <div
      className="flex w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] px-[1rem] 
    py-[.5rem] text-[var(--text-main-color-normal)] laptop:h-[6rem]"
    >
      <div className="flex items-center gap-[1rem]">
        <ImageWithLightBoxAndNoLazy
          src={
            conversations.selected.isGroup
              ? conversations.selected.avatar
              : conversations.selected.participants?.find(
                  (item) => item.contact.id !== info.id,
                )?.contact.avatar
          }
          className="loaded aspect-square w-[4rem] cursor-pointer rounded-[50%] bg-[size:150%]"
          onClick={() => {
            if (conversations.selected.isGroup) setOpenUpdateTitle(true);
          }}
        />
        <BackgroundPortal
          show={openUpdateTitle}
          className="laptop:!w-[45rem] desktop:!w-[35%]"
          title="Update title"
          onClose={() => setOpenUpdateTitle(false)}
        >
          <UpdateConversation
            selected={conversations.selected}
            onClose={() => setOpenUpdateTitle(false)}
          />
        </BackgroundPortal>

        <div className="relative flex grow flex-col laptop:max-w-[30rem] desktop:max-w-[50rem]">
          {conversations.selected.isGroup ? (
            <>
              <div className="flex w-full gap-[.5rem]">
                <CustomLabel
                  className="text-start text-lg font-bold"
                  title={conversations.selected.title}
                  tooltip
                />
                {/* <UpdateTitle /> */}
              </div>
              <p>{conversations.selected.participants.length} members</p>
            </>
          ) : (
            <>
              <CustomLabel
                className="text-start text-lg font-bold"
                title={
                  conversations.selected.participants?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.name
                }
              />
              {/* <FriendRequestButton
              className="fa fa-user-plus !ml-0 w-auto px-[1rem] text-xs laptop:h-[2rem]"
              onClose={() => {}}
            /> */}
            </>
          )}
        </div>
      </div>
      <div className="flex gap-[2rem]">
        {conversations.selected.isGroup ? (
          // <RelightBackground
          //   paddingClassName="p-[.7rem]"
          //   onClick={() => setShowAddMembers(true)}
          // >
          <AddMembers
            selected={conversations.selected}
            show={showAddMembers}
            onClose={() => setShowAddMembers(false)}
          />
        ) : (
          // </RelightBackground>
          ""
        )}
        <div
          className={`flex justify-end gap-[1rem] rounded-full 
            ${toggle === "information" ? "text-[var(--main-color-bold)] hover:text-[var(--main-color)]" : "hover:text-[var(--main-color-bold)]"}`}
        >
          <InfoCircleOutlined
            onClick={() =>
              setToggle((current) =>
                current === "information" ? "" : "information",
              )
            }
            style={{
              fontSize: "18px",
              transition: "all 0.2s",
            }}
          />
        </div>
        {/* <div
          className="cursor-pointer bg-[url('images/attachment-svg.svg')] bg-[size:100%] bg-[position:center_center] bg-no-repeat transition-all
        duration-500 laptop:w-[2rem]"
        ></div> */}
        <AttachmentIcon
          onClick={() =>
            setToggle((current) =>
              current === "attachment" ? "" : "attachment",
            )
          }
          toggle={toggle === "attachment"}
        />
      </div>
    </div>
  );
};

export default ChatboxHeader;
