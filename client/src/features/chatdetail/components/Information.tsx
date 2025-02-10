import { useQueryClient } from "@tanstack/react-query";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBox from "../../../components/ImageWithLightBox";
import OnlineStatusDot from "../../../components/OnlineStatusDot";
import blurImage from "../../../utils/blurImage";
import useInfo from "../../authentication/hooks/useInfo";
import useChatDetailToggles from "../../chatbox/hooks/useChatDetailToggles";
import QuickChat from "../../friend/components/QuickChat";
import { ContactModel } from "../../friend/types";
import useConversation from "../../listchat/hooks/useConversation";
import { AttachmentModel } from "../../listchat/types";
import useAttachment from "../hooks/useAttachment";

const Information = () => {
  // console.log("Information calling");
  // const { show, toggle } = props;
  const { toggle, setToggle } = useChatDetailToggles();

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data: attachments } = useAttachment();

  const refInformation = useRef<HTMLDivElement>();

  const [displayAttachments, setDisplayAttachments] = useState<
    AttachmentModel[]
  >([]);
  const [chosenProfile, setChosenProfile] = useState<ContactModel>();
  const [quickChatRect, setQuickChatRect] = useState<DOMRect>();
  const [informationoffsetWidth, setInformationoffsetWidth] =
    useState<number>();

  useEffect(() => {
    setChosenProfile(undefined);
    blurImage(".members-image-container");
  }, [conversations.selected?.id]);

  useEffect(() => {
    blurImage(".members-image-container");
  }, [conversations.selected?.members]);

  useEffect(() => {
    if (!attachments) return;

    if (attachments?.length !== 0) {
      const mergedArr: AttachmentModel[] = attachments.reduce(
        (result, item) => {
          return result.concat(item.attachments);
        },
        [],
      );
      setDisplayAttachments(mergedArr.slice(0, 8));
    } else {
      setDisplayAttachments([]);
    }
  }, [attachments]);

  useEffect(() => {
    blurImage(".display-attachment-container");
  }, [displayAttachments]);

  // const updateAvatar = async (e) => {
  //   // Create a root reference
  //   const storage = getStorage();
  //   const file = e.target.files[0];

  //   queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
  //     const updatedConversations = oldData.conversations.map((conversation) => {
  //       if (conversation.id !== conversations?.selected.id) return conversation;
  //       return {
  //         ...conversation,
  //         avatar: URL.createObjectURL(file),
  //       };
  //     });
  //     return {
  //       ...oldData,
  //       conversations: updatedConversations,
  //       selected: {
  //         ...oldData.selected,
  //         avatar: URL.createObjectURL(file),
  //       },
  //       noLoading: true,
  //     };
  //   });

  //   const url = await uploadBytes(
  //     ref(storage, `avatar/${file.name}`),
  //     file,
  //   ).then((snapshot) => {
  //     return getDownloadURL(snapshot.ref).then((url) => {
  //       return url;
  //     });
  //   });
  //   const body = {
  //     title: conversations?.selected.title,
  //     avatar: url,
  //   };

  //   HttpRequest({
  //     method: "put",
  //     url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETBYID.replace(
  //       "{id}",
  //       conversations?.selected.id,
  //     ),
  //     data: body,
  //   });

  //   e.target.value = null;
  // };

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 pb-4 ${toggle === "information" ? "z-10" : "z-0"} flex h-full w-full flex-col bg-[var(--bg-color)]`}
    >
      {/* <div
        className="flex shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--text-main-color-light)] 
        px-[2rem] py-[.5rem] laptop:h-[6rem]"
      >
        <p className="text-md text-[var(--text-main-color)]">Information</p>
      </div> */}
      <div className="flex grow flex-col [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)] [&>*]:p-[1rem]">
        {conversations.selected?.isGroup ? (
          <div className="flex flex-col gap-[1rem] laptop:h-[30rem]">
            <p className="text-base">Members</p>
            {/* Still don't know why scrolling not working without adding h-0 */}
            <div className="members-image-container hide-scrollbar flex h-0 grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth">
              {conversations.selected?.members
                .filter((item) => item.contact.id !== info.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="information-members flex w-full cursor-pointer items-center gap-[1rem] rounded-[.5rem] p-2 hover:bg-[var(--bg-color-extrathin)]"
                    onClick={(e: MouseEvent<HTMLElement>) => {
                      // Get the bounding rectangle of the target element
                      const target = e.target as HTMLElement;
                      const rect = target.getBoundingClientRect();
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
                    <div className="relative">
                      <ImageWithLightBox
                        src={item.contact.avatar}
                        className="aspect-square laptop:w-[3rem]"
                        imageClassName="bg-[size:160%]"
                        roundedClassName="rounded-[50%]"
                        slides={[
                          {
                            src: item.contact.avatar,
                          },
                        ]}
                        onClick={() => {}}
                      />
                      <OnlineStatusDot
                        className="bottom-[-5%] left-[80%]"
                        online={item.contact.isOnline}
                      />
                    </div>
                    <CustomLabel title={item.contact.name} />
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
        {displayAttachments.length !== 0 ? (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex justify-between">
              <p className="text-base">Attachments</p>
              <div
                onClick={() => setToggle("attachment")}
                className="cursor-pointer text-[var(--main-color-bold)] hover:text-[var(--main-color)]"
              >
                See all
              </div>
            </div>
            <div className="display-attachment-container grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
              {displayAttachments.map((item, index) => (
                <ImageWithLightBox
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  // className="aspect-square w-full cursor-pointer rounded-2xl bg-[size:200%]"
                  className={`aspect-square w-full`}
                  imageClassName="bg-[size:160%]"
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
        ) : (
          ""
        )}
        {/* {displayAttachments.length !== 0 ? (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex justify-between">
              <p className="text-base text-[var(--text-main-color)]">
                Attachments
              </p>
              <div
                onClick={toggle}
                className="cursor-pointer text-[var(--main-color)] hover:text-[var(--main-color-light)]"
              >
                See all
              </div>
            </div>
            <div className="display-attachment-container relative grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
              <LocalLoading />
              {displayAttachments.map((item, index) => (
                <ImageWithLightBox
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  // className="aspect-square w-full cursor-pointer rounded-2xl bg-[size:200%]"
                  className={`aspect-square w-full`}
                  spinnerClassName="laptop:bg-[size:1.5rem]"
                  imageClassName="bg-[size:160%]"
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
        ) : (
          ""
        )} */}

        {/* <DeleteConfirmation
          title="Delete chat"
          message="Are you sure want to delete this chat?"
          onSubmit={() => {
            // deleteChat(members).then(() => {
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
