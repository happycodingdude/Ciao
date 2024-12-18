import { InfoCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useInfo } from "../../hook/CustomHooks";
import BackgroundPortal from "../common/BackgroundPortal";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import RelightBackground from "../common/RelightBackground";
import AddMembers from "./AddMembers";
import UpdateTitle from "./UpdateTitle";

const ChatboxHeader = (props) => {
  console.log("ChatboxHeader calling");
  const { toggleInformation, showInfo, selected } = props;
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
            selected?.isGroup
              ? selected?.avatar
              : selected?.participants?.find(
                  (item) => item.contact.id !== info.id,
                )?.contact.avatar
          }
          className="aspect-square w-[4rem] cursor-pointer rounded-[50%] bg-[size:150%]"
          onClick={() => setOpenUpdateTitle(true)}
        />
        <BackgroundPortal
          show={openUpdateTitle}
          className="laptop:!w-[40rem] desktop:!w-[35%]"
          title="Update title"
          onClose={() => setOpenUpdateTitle(false)}
        >
          <UpdateTitle
            id={selected?.id}
            title={selected?.title}
            avatar={selected?.avatar}
            onClose={() => setOpenUpdateTitle(false)}
          />
        </BackgroundPortal>

        <div className="relative flex grow flex-col laptop:max-w-[30rem] desktop:max-w-[50rem]">
          {selected?.isGroup ? (
            <>
              <div className="flex w-full gap-[.5rem]">
                <CustomLabel
                  className="text-start text-lg font-bold"
                  title={selected?.title}
                  tooltip
                />
                {/* <UpdateTitle /> */}
              </div>
              <p>{selected?.participants.length} members</p>
            </>
          ) : (
            <>
              <CustomLabel
                className="text-start text-lg font-bold"
                title={
                  selected?.participants?.find(
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
        {selected?.isGroup ? (
          <RelightBackground
            paddingClassName="p-[.7rem]"
            onClick={() => setShowAddMembers(true)}
          >
            <AddMembers
              selected={selected}
              show={showAddMembers}
              onClose={() => setShowAddMembers(false)}
            />
          </RelightBackground>
        ) : (
          ""
        )}
        <div
          className={`flex justify-end gap-[1rem] rounded-full 
            ${showInfo ? "text-[var(--main-color-bold)] hover:text-[var(--main-color)]" : ""}`}
        >
          <InfoCircleOutlined
            onClick={() => toggleInformation((current) => !current)}
            style={{ fontSize: "20px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatboxHeader;
