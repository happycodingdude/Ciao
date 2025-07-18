import { useQueryClient } from "@tanstack/react-query";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import OnlineStatusDot from "../../../components/OnlineStatusDot";
import useLocalStorage from "../../../hooks/useLocalStorage";
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
  const [showMembers, setShowMembers] = useLocalStorage("showMembers", true);

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data: attachmentCache } = useAttachment();

  const refInformation = useRef<HTMLDivElement>();
  const refMembers = useRef<HTMLDivElement>();

  const [displayAttachments, setDisplayAttachments] = useState<
    AttachmentModel[]
  >([]);
  const [chosenProfile, setChosenProfile] = useState<ContactModel>();
  const [quickChatRect, setQuickChatRect] = useState<DOMRect>();
  const [informationoffsetWidth, setInformationoffsetWidth] =
    useState<number>();
  // const [showMembers, setShowMembers] = useState<boolean>(true);

  useEffect(() => {
    setChosenProfile(undefined);
    // blurImage(".members-image-container");
  }, [conversations.selected?.id]);

  useEffect(() => {
    // blurImage(".members-image-container");
  }, [conversations.selected?.members]);

  useEffect(() => {
    if (!attachmentCache) return;

    if (attachmentCache.attachments.length !== 0) {
      const mergedArr: AttachmentModel[] = attachmentCache.attachments.reduce(
        (result, item) => {
          return result.concat(item.attachments);
        },
        [],
      );
      setDisplayAttachments(mergedArr.slice(0, 8));
    } else {
      setDisplayAttachments([]);
    }
  }, [attachmentCache]);

  const toggleMembers = (): void => {
    setShowMembers((current) => !current);
  };

  // useEffect(() => {
  //   if (showMembers)
  // },[showMembers])

  // useEffect(() => {
  //   blurImage(".display-attachment-container");
  // }, [displayAttachments]);

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
      className={`absolute top-0 pb-4 ${toggle === "information" ? "z-10" : "z-0"} hide-scrollbar flex h-full w-full flex-col overflow-y-auto bg-[var(--bg-color)]`}
    >
      {/* Container */}
      <div className="flex grow flex-col [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)] [&>*]:p-[1rem]">
        <div className="flex flex-col items-center gap-[1rem] bg-pastel-pink bg-opacity-50">
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
            className="relative aspect-square w-[10rem] cursor-pointer"
            // imageClassName="bg-[size:150%]"
            circle
          />
          {/* MARK: TITLE  */}
          <div className="flex w-[70%] grow flex-col items-center justify-center phone:text-lg laptop:text-md">
            {conversations.selected.isGroup ? (
              <>
                <CustomLabel
                  className="text-center font-bold"
                  title={conversations.selected.title}
                  tooltip
                />
                <p className="phone:text-md laptop:text-sm">
                  {conversations.selected.members.length} members
                </p>
              </>
            ) : (
              <>
                <CustomLabel
                  className="text-center font-bold"
                  title={
                    conversations.selected.members?.find(
                      (item) => item.contact.id !== info.id,
                    )?.contact.name
                  }
                  tooltip
                />
              </>
            )}
          </div>
        </div>
        {/* MARK: MEMBERS  */}
        {conversations.selected?.isGroup ? (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex justify-between pr-[1rem]">
              <p className="font-bold">Members</p>
              {/* <div className="flex h-full cursor-pointer items-center justify-center">
                <i
                  data-show={showMembers}
                  className="fa-arrow-down fa  font-normal transition-all duration-500 
                data-[show=false]:rotate-90 phone:text-xl laptop:text-md"
                  onClick={toggleMembers}
                ></i>
              </div> */}
              <i
                data-show={showMembers}
                className="fa-arrow-down fa flex aspect-square h-full cursor-pointer items-center justify-center p-[.5rem] transition-all
                duration-500 data-[show=false]:rotate-90 phone:text-xl laptop:text-md"
                onClick={toggleMembers}
              ></i>
            </div>
            {/* Still don't know why scrolling not working without adding h-0 */}
            <div
              ref={refMembers}
              data-show={showMembers}
              className="members-image-container hide-scrollbar flex flex-col gap-[1rem] overflow-y-auto scroll-smooth transition-all duration-500
                data-[show=false]:max-h-0 data-[show=false]:opacity-0 data-[show=true]:opacity-100 phone:max-h-[20rem] laptop-lg:max-h-[25rem] desktop:max-h-[50rem]"
            >
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
                      <ImageWithLightBoxAndNoLazy
                        src={item.contact.avatar}
                        className="loaded aspect-square w-[3rem]"
                        // imageClassName="bg-[size:160%]"
                        // roundedClassName="rounded-[50%]"
                        circle
                        slides={[
                          {
                            src: item.contact.avatar,
                          },
                        ]}
                        onClick={() => {}}
                      />
                      <OnlineStatusDot
                        className="right-[-20%] top-[-10%]"
                        online={item.contact.isOnline}
                      />
                    </div>
                    <CustomLabel title={item.contact.name} />
                  </div>
                ))}
            </div>

            {/* MARK: PROFILE QUICK CHAT  */}
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
        {/* MARK: ATTACHMENTS  */}
        {displayAttachments.length !== 0 ? (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex justify-between">
              <p className="font-bold">Attachments</p>
              <div
                onClick={() => setToggle("attachment")}
                className="cursor-pointer text-[var(--main-color-extrabold)] hover:text-[var(--main-color)]"
              >
                View all
              </div>
            </div>
            <div className="display-attachment-container grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
              {displayAttachments.map((item, index) => (
                <ImageWithLightBoxAndNoLazy
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  // className="aspect-square w-full cursor-pointer rounded-2xl bg-[size:200%]"
                  className={`aspect-square w-full`}
                  // imageClassName="bg-[size:200%]"
                  slides={displayAttachments.map((item) => ({
                    src:
                      item.type === "image"
                        ? item.mediaUrl
                        : "images/filenotfound.svg",
                  }))}
                  index={index}
                  pending={item.pending}
                  local={item.local}
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
