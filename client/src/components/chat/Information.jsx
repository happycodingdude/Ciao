import { Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useAttachment, useInfo, useMessage } from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../common/MediaPicker";
import OnlineStatusDot from "../common/OnlineStatusDot";
import RelightBackground from "../common/RelightBackground";
import QuickChat from "../friend/QuickChat";
import AddParticipants from "./AddParticipants";

const Information = (props) => {
  console.log("Information calling");
  const { show, toggle } = props;

  const { data: info } = useInfo();
  const { data: messages } = useMessage();
  const { data: attachments } = useAttachment();

  const [displayAttachments, setDisplayAttachments] = useState([]);
  const [chosenProfile, setChosenProfile] = useState();
  const [quickChatRect, setQuickChatRect] = useState();
  const [informationoffsetWidth, setInformationoffsetWidth] = useState();

  useEffect(() => {
    setChosenProfile(undefined);
  }, [messages?.id]);

  useEffect(() => {
    if (!attachments) return;

    if (attachments?.length !== 0) {
      const mergedArr = attachments.reduce((result, item) => {
        return result.concat(item.attachments);
      }, []);
      setDisplayAttachments(mergedArr.slice(0, 8));
    } else {
      setDisplayAttachments([]);
    }
  }, [attachments]);

  const refInformation = useRef();
  const hideInformation = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.add("animate-flip-scale-down-vertical");
  };

  // const updateAvatar = async (e) => {
  //   // Create a root reference
  //   const storage = getStorage();
  //   const file = e.target.files[0];
  //   const url = await uploadBytes(
  //     ref(storage, `avatar/${file.name}`),
  //     file,
  //   ).then((snapshot) => {
  //     return getDownloadURL(snapshot.ref).then((url) => {
  //       return url;
  //     });
  //   });
  //   const body = [
  //     {
  //       op: "replace",
  //       path: "avatar",
  //       value: url,
  //     },
  //   ];

  //   HttpRequest({
  //     method: "patch",
  //     url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETBYID.replace(
  //       "{id}",
  //       selected.id,
  //     ),
  //     data: body,
  //   }).then((res) => {
  //     setSelected((current) => ({ ...current, avatar: url }));
  //     setConversations((current) => {
  //       return current.map((item) => {
  //         if (item.id === selected.id) item.avatar = url;
  //         return item;
  //       });
  //     });
  //   });

  //   e.target.value = null;
  // };

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 ${show ? "z-10" : "z-0"}  flex h-full w-full flex-col bg-[var(--bg-color-light)] `}
    >
      <div
        className="flex shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--text-main-color-light)] 
        px-[2rem] py-[.5rem] laptop:h-[6rem]"
      >
        <p className="text-md text-[var(--text-main-color)]">Information</p>
      </div>
      <div className="mt-[1rem] flex grow flex-col [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--text-main-color-light)] [&>*]:p-[1rem]">
        <div className="information-container flex flex-col gap-[1rem]">
          <div className="relative flex flex-col items-center gap-[1rem]">
            {messages.isGroup ? (
              <>
                <ImageWithLightBoxAndNoLazy
                  src={messages.avatar}
                  className="aspect-square cursor-pointer rounded-[1rem] laptop:w-[7rem]"
                  slides={[
                    {
                      src: messages.avatar,
                    },
                  ]}
                />
                <MediaPicker
                  className="absolute laptop:left-[5rem] laptop:top-[-1rem]"
                  accept="image/png, image/jpeg"
                  id="conversation-avatar"
                  // onChange={updateAvatar}
                />
                <CustomLabel
                  className="text-base text-[var(--text-main-color)] laptop:max-w-[15rem] laptop-lg:max-w-[20rem] desktop:max-w-[30rem]"
                  title={messages.title}
                  tooltip
                />
                {/* <div className="cursor-pointer text-[var(--text-main-color-blur)]">
                  {messages.participants.length} members
                </div> */}
                <div className="flex justify-center">
                  {/* <ToggleNotification /> */}
                  <Tooltip title="Invite friends">
                    <RelightBackground>
                      <AddParticipants />
                    </RelightBackground>
                  </Tooltip>
                </div>
              </>
            ) : (
              <>
                <ImageWithLightBoxAndNoLazy
                  src={
                    messages.participants?.find(
                      (item) => item.contact.id !== info.data.id,
                    )?.contact.avatar
                  }
                  className="aspect-square cursor-pointer rounded-[1rem] !bg-[size:170%] laptop:w-[7rem]"
                  slides={[
                    {
                      src: messages.participants?.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.avatar,
                    },
                  ]}
                />
                <CustomLabel
                  className="text-base text-[var(--text-main-color)] laptop:max-w-[15rem] laptop-lg:max-w-[20rem] desktop:max-w-[30rem]"
                  title={
                    messages.participants?.find(
                      (item) => item.contact.id !== info.data.id,
                    )?.contact.name
                  }
                />
              </>
            )}
          </div>
        </div>
        <div className="display-attachment-container flex flex-col">
          <div className="flex justify-between">
            <p className="text-base text-[var(--text-main-color)]">
              Attachments
            </p>
            {displayAttachments.length !== 0 ? (
              <div
                onClick={toggle}
                className="cursor-pointer text-[var(--main-color)] hover:text-[var(--main-color-light)]"
              >
                See all
              </div>
            ) : (
              ""
            )}
          </div>
          {/* <div className="grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
            {displayAttachments.map((item, index) => (
              <ImageWithLightBox
                src={item.mediaUrl}
                title={item.mediaName?.split(".")[0]}
                className="aspect-square w-full cursor-pointer rounded-2xl bg-[size:200%]"
                slides={displayAttachments.map((item) => ({
                  src:
                    item.type === "image"
                      ? item.mediaUrl
                      : "images/filenotfound.svg",
                }))}
                index={index}
              />
            ))}
          </div> */}
        </div>
        {messages.isGroup ? (
          <div className="flex grow flex-col gap-[1rem]">
            <p className="text-base text-[var(--text-main-color)]">Members</p>
            {/* Still don't know why scrolling not working without adding h-0 */}
            <div className="hide-scrollbar flex h-0 grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth">
              {messages.participants
                .filter((item) => item.contact.id !== info.data.id)
                .map((item) => (
                  <div
                    key={item}
                    className="information-members flex w-full cursor-pointer items-center gap-[1rem] rounded-[.5rem] p-2 hover:bg-[var(--bg-color-extrathin)]"
                    onClick={(e) => {
                      // Get the bounding rectangle of the target element
                      const rect = e.target.getBoundingClientRect();
                      setQuickChatRect(rect);
                      setInformationoffsetWidth(
                        refInformation.current.offsetWidth,
                      );

                      setChosenProfile({
                        id: item.contact.id,
                        avatar: item.contact.avatar,
                        isOnline: item.contact.isOnline,
                        name: item.contact.name,
                        friendId: item.friendId,
                        friendStatus:
                          item.friendStatus === "friend"
                            ? null
                            : item.friendStatus,
                      });
                    }}
                  >
                    {/* <div className="absolute left-[-2rem] top-[-2rem] z-[1000] aspect-square w-[3rem] bg-red-300"></div> */}
                    <div className="information-members relative">
                      <ImageWithLightBoxAndNoLazy
                        src={item.contact.avatar}
                        className="information-members aspect-square cursor-pointer rounded-[50%] laptop:w-[3rem]"
                        slides={[
                          {
                            src: item.contact.avatar,
                          },
                        ]}
                        onClick={(e) => {}}
                      />
                      <OnlineStatusDot online={item.contact.isOnline} />
                    </div>
                    <CustomLabel
                      title={item.contact.name}
                      className="information-members"
                    />
                  </div>
                ))}
            </div>
            {/* Profile quick chat */}
            <QuickChat
              profile={chosenProfile}
              rect={quickChatRect}
              offset={informationoffsetWidth}
              onClose={() => setChosenProfile(undefined)}
            />
          </div>
        ) : (
          ""
        )}

        {/* <DeleteConfirmation
          title="Delete chat"
          message="Are you sure want to delete this chat?"
          onSubmit={() => {
            // deleteChat(participants).then(() => {
            //   removeConversation(selected.id);
            //   setSelected(undefined);
            // });
          }}
        /> */}
      </div>
    </div>
  );
};

export default Information;
