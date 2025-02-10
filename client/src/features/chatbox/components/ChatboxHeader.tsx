import { InfoCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import OnlineStatusDot from "../../../components/OnlineStatusDot";
import useInfo from "../../authentication/hooks/useInfo";
import AttachmentIcon from "../../chatdetail/components/AttachmentIcon";
import useConversation from "../../listchat/hooks/useConversation";
import useChatDetailToggles from "../hooks/useChatDetailToggles";
import AddMembers from "./AddMembers";
import UpdateConversation from "./UpdateConversation";

const ChatboxHeader = () => {
  // console.log("ChatboxHeader calling");
  // const { toggle, setToggle } = props;
  const { toggle, setToggle } = useChatDetailToggles();

  const { data: conversations } = useConversation();
  if (!conversations || !conversations.selected) return;

  const { data: info } = useInfo();

  const [openUpdateTitle, setOpenUpdateTitle] = useState<boolean>(false);
  const [showAddMembers, setShowAddMembers] = useState<boolean>(false);

  return (
    <div
      className="flex w-full shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] px-[1rem] 
    py-[.5rem] text-[var(--text-main-color-normal)] laptop:h-[6rem]"
    >
      <div className="relative flex items-center gap-[1rem]">
        <ImageWithLightBoxAndNoLazy
          src={
            conversations.selected.isGroup
              ? conversations.selected.avatar
              : conversations.selected.members?.find(
                  (item) => item.contact.id !== info.id,
                )?.contact.avatar
          }
          className="loaded relative aspect-square w-[4rem] cursor-pointer"
          imageClassName="bg-[size:170%]"
          circle
          onClick={() => {
            if (conversations.selected.isGroup) setOpenUpdateTitle(true);
          }}
        />
        {!conversations.selected.isGroup ? (
          <OnlineStatusDot
            className="left-[20%] top-[-5%]"
            online={
              conversations.selected.members?.find(
                (item) => item.contact.id !== info.id,
              )?.contact.isOnline
            }
          />
        ) : (
          ""
        )}
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

        <div className="relative flex grow flex-col laptop:max-w-[30rem] desktop:max-w-[50rem]">
          {conversations.selected.isGroup ? (
            <>
              <div className="flex w-full gap-[.5rem]">
                <CustomLabel
                  className="text-start text-lg font-bold"
                  title={conversations.selected.title}
                />
                {/* <UpdateTitle /> */}
              </div>
              <p>{conversations.selected.members.length} members</p>
            </>
          ) : (
            <>
              <CustomLabel
                className="text-start text-lg font-bold"
                title={
                  conversations.selected.members?.find(
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
          <AddMembers />
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
                current === "information" ? null : "information",
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
