import React, { useEffect, useRef, useState } from "react";
import { blurImage } from "../../common/Utility";
import {
  useAttachment,
  useInfo,
  useMessage,
  useParticipant,
} from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";
import MediaPicker from "../common/MediaPicker";
import RelightBackground from "../common/RelightBackground";
import AddParticipants from "./AddParticipants";

const Information = (props) => {
  console.log("Information calling");
  const { show, toggle } = props;

  const { data: info } = useInfo();
  const { data: messages } = useMessage();
  const { data: participants } = useParticipant();
  const { data: attachments } = useAttachment();
  const [displayAttachments, setDisplayAttachments] = useState([]);

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

  useEffect(() => {
    blurImage(".information-container");
  }, [messages]);

  useEffect(() => {
    blurImage(".display-attachment-container");
  }, [displayAttachments]);

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
        className="flex items-center justify-between border-b-[.1rem] border-b-[var(--text-main-color-light)] px-[2rem] 
        py-[.5rem] laptop:h-[5rem]"
      >
        <p className="text-[var(--text-main-color)]">Information</p>
      </div>
      <div className="mt-[1rem] flex grow flex-col [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--text-main-color-light)] [&>*]:p-[1rem]">
        <div className="information-container flex flex-col gap-[1rem]">
          <div className="relative flex flex-col items-center gap-[.5rem]">
            {messages.isGroup ? (
              <>
                <ImageWithLightBoxWithShadowAndNoLazy
                  src={messages.avatar}
                  className="aspect-square cursor-pointer rounded-[1rem] laptop:w-[7rem]"
                  slides={[
                    {
                      src: messages.avatar,
                    },
                  ]}
                />
                <MediaPicker
                  className="absolute left-[30%] top-[-15%]"
                  accept="image/png, image/jpeg"
                  id="conversation-avatar"
                  // onChange={updateAvatar}
                />
                <CustomLabel
                  className="text-base text-[var(--text-main-color)] laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={messages.title}
                  tooltip
                />
                {/* <div className="cursor-pointer text-[var(--text-main-color-blur)]">
                  {messages.participants.length} members
                </div> */}
              </>
            ) : (
              <>
                <ImageWithLightBoxWithShadowAndNoLazy
                  src={
                    messages.participants?.find(
                      (item) => item.contact.id !== info.data.id,
                    )?.contact.avatar
                  }
                  className="aspect-square cursor-pointer rounded-[1rem] laptop:w-[7rem]"
                  slides={[
                    {
                      src: messages.participants?.find(
                        (item) => item.contact.id !== info.data.id,
                      )?.contact.avatar,
                    },
                  ]}
                />
                <CustomLabel
                  className="text-base text-[var(--text-main-color)] laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={
                    messages.participants?.find(
                      (item) => item.contact.id !== info.data.id,
                    )?.contact.name
                  }
                />
              </>
            )}
          </div>
          <div className="flex w-full justify-center gap-[2rem]">
            {messages.isGroup ? (
              <>
                {/* <ToggleNotification /> */}
                <RelightBackground className="w-[15%] cursor-pointer">
                  <AddParticipants />
                </RelightBackground>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="display-attachment-container flex flex-col gap-[1rem]">
          <div className="flex justify-between">
            <label className="text-[var(--text-main-color)]">Attachments</label>
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
          <div className="grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
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
          </div>
        </div>
        {messages.isGroup ? (
          <div className="flex grow flex-col gap-[2rem]">
            <label className="text-[var(--text-main-color)]">Members</label>
            <div className="hide-scrollbar flex flex-col gap-[1rem] overflow-y-scroll scroll-smooth">
              {messages.participants
                .filter((item) => item.contact.id !== info.data.id)
                .map((item) => (
                  <div className="flex w-full cursor-pointer items-center gap-[1rem] py-2 hover:bg-[var(--bg-color-thin)]">
                    <div className="relative">
                      <ImageWithLightBoxWithShadowAndNoLazy
                        src={item.contact.avatar}
                        className="aspect-square cursor-pointer rounded-[50%] laptop:w-[4rem]"
                        slides={[
                          {
                            src: item.contact.avatar,
                          },
                        ]}
                      />
                      <div
                        className={`absolute bottom-0 right-[-10%] aspect-square w-[1rem] rounded-[50%] 
                        ${item.contact.isOnline ? "bg-[var(--online-color)]" : "bg-[var(--offline-color)]"}`}
                      ></div>
                    </div>
                    <p>{item.contact.name}</p>
                  </div>
                ))}
            </div>
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
