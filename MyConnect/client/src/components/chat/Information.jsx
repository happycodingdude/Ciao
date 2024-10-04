import React, { useEffect, useRef, useState } from "react";
import { blurImage } from "../../common/Utility";
import {
  useAttachment,
  useInfo,
  useMessage,
  useParticipant,
} from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import DeleteConfirmation from "../common/DeleteConfirmation";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import MediaPicker from "../common/MediaPicker";
import AddParticipants from "./AddParticipants";

const Information = (props) => {
  console.log("Information calling");
  const { refAttachment, refInformationExposed } = props;

  // const auth = useAuth();
  // const { selected, setSelected, setConversations } = useFetchConversations();
  const { data: info } = useInfo();
  const { data: messages } = useMessage();
  const { data: participants } = useParticipant();
  const { data: attachments } = useAttachment();
  const [displayAttachments, setDisplayAttachments] = useState([]);
  // const { deleteChat } = useDeleteChat();
  // const { removeConversation } = useFetchConversations();
  // const { profile } = useFetchFriends();

  useEffect(() => {
    refInformationExposed.showInformation = () => {
      refInformation.current.classList.remove(
        "animate-flip-scale-down-vertical",
      );
      refInformation.current.classList.add("animate-flip-scale-up-vertical");
    };
  }, []);

  useEffect(() => {
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

  const reset = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.remove("animate-flip-scale-down-vertical");
  };

  // useEffect(() => {
  //   reset();
  // }, [selected.id]);

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

  const hideInformation = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.add("animate-flip-scale-down-vertical");
  };

  const showAllAttachment = () => {
    hideInformation();
    refAttachment.showAttachment();
  };

  return (
    <div
      ref={refInformation}
      className="relative z-10 flex h-full flex-col bg-[var(--bg-color)]"
    >
      <div
        className="flex h-[7rem] shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] 
        px-[2rem] py-[.5rem]"
      >
        <p className="font-bold">Information</p>
      </div>
      <div
        className=" hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth 
      [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)] [&>*]:p-[1rem]"
      >
        <div className="information-container flex flex-col gap-[1rem]">
          <div className="relative flex flex-col items-center gap-[.5rem]">
            {/* <ImageWithLightBoxWithBorderAndShadow
              src={selected.Avatar ?? ""}
              className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
              onClick={() => {}}
            /> */}
            {messages.isGroup ? (
              <>
                <ImageWithLightBoxWithBorderAndShadow
                  src={messages.avatar}
                  className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                  onClick={() => {}}
                  immediate={true}
                />
                <MediaPicker
                  className="absolute left-[42%] top-[-10%]"
                  accept="image/png, image/jpeg"
                  id="conversation-avatar"
                  // onChange={updateAvatar}
                />
                <CustomLabel
                  className="font-bold laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={messages.title}
                  tooltip
                />
                {/* <div className="cursor-pointer text-[var(--text-main-color-blur)]">
                  {messages.participants.length} members
                </div> */}
              </>
            ) : (
              <>
                <ImageWithLightBoxWithBorderAndShadow
                  src={
                    messages.participants?.find(
                      (item) => item.contact.id !== info.data.id,
                    )?.contact.avatar
                  }
                  className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                  slides={[
                    {
                      src:
                        messages.participants?.find(
                          (item) => item.contact.id !== info.data.id,
                        )?.contact.avatar ?? "",
                    },
                  ]}
                  immediate={true}
                />
                <CustomLabel
                  className="font-bold laptop:max-w-[50%] desktop:max-w-[70%]"
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
                <AddParticipants />
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="display-attachment-container flex flex-col gap-[1rem]">
          <div className="flex justify-between">
            <label className="font-bold">Attachments</label>
            {displayAttachments.length !== 0 ? (
              <div
                onClick={showAllAttachment}
                className="cursor-pointer text-[var(--main-color)] hover:text-[var(--main-color-bold)]"
              >
                See all
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
            {/* {messages?.messages
              .filter((mess) => mess.type === "media")
              .flatMap((mess) => mess.attachments)
              .map((item, index) => (
                <ImageWithLightBox
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  className="aspect-square w-full cursor-pointer rounded-2xl bg-[size:150%]"
                  slides={attachments?.map((item) => ({
                    src:
                      item.type === "image"
                        ? item.mediaUrl
                        : "images/filenotfound.svg",
                  }))}
                  index={index}
                />
              ))} */}

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
        <DeleteConfirmation
          title="Delete chat"
          message="Are you sure want to delete this chat?"
          onSubmit={() => {
            // deleteChat(participants).then(() => {
            //   removeConversation(selected.id);
            //   setSelected(undefined);
            // });
          }}
        />
      </div>
    </div>
  );
};

export default Information;
