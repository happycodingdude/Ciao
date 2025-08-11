import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { MouseEvent, useEffect, useRef, useState } from "react";
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
  const queryClient = useQueryClient();

  const { data: conversations } = useConversation();
  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const { toggle, setToggle } = useChatDetailToggles();
  const [showMembers, setShowMembers] = useLocalStorage("showMembers", true);

  const { data: info } = useInfo();
  const { data: attachmentCache } = useAttachment(conversationId);

  const refInformation = useRef<HTMLDivElement>();
  const refMembers = useRef<HTMLDivElement>();

  const [displayAttachments, setDisplayAttachments] = useState<
    AttachmentModel[]
  >([]);
  const [chosenProfile, setChosenProfile] = useState<ContactModel>();
  const [quickChatRect, setQuickChatRect] = useState<DOMRect>();
  const [informationoffsetWidth, setInformationoffsetWidth] =
    useState<number>();

  useEffect(() => {
    setChosenProfile(undefined);
  }, [conversationId]);

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

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 pb-4 ${toggle === "information" ? "z-10" : "z-0"} hide-scrollbar flex h-full w-full flex-col overflow-y-auto bg-white`}
    >
      {/* Container */}
      <div className="flex grow flex-col [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)] [&>*]:p-[1rem]">
        <div className="flex flex-col items-center gap-[1.5rem]">
          {/* MARK: AVATAR  */}
          <ImageWithLightBoxAndNoLazy
            src={
              conversation?.isGroup
                ? conversation.avatar
                : conversation.members?.find(
                    (item) => item.contact.id !== info.id,
                  )?.contact.avatar
            }
            slides={[
              {
                src: conversation?.isGroup
                  ? conversation.avatar
                  : conversation.members?.find(
                      (item) => item.contact.id !== info.id,
                    )?.contact.avatar,
              },
            ]}
            className="relative aspect-square w-[10rem] cursor-pointer"
            circle
          />
          {/* MARK: TITLE  */}
          <div className="flex w-[70%] grow flex-col items-center justify-center gap-[.5rem] phone:text-lg laptop:text-md">
            {conversation?.isGroup ? (
              <>
                <CustomLabel
                  className="font-be-vn-bold text-center"
                  title={conversation.title}
                  tooltip
                />
                <p className="phone:text-md laptop:text-base">
                  {conversation.members.length} members
                </p>
              </>
            ) : (
              <>
                <CustomLabel
                  className="font-be-vn-bold text-center"
                  title={
                    conversation.members?.find(
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
        {conversation?.isGroup ? (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex justify-between pr-[1rem]">
              <p className="font-be-vn-bold">
                Members ({conversation.members.length})
              </p>
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
              {[...conversation?.members]
                .sort((a, b) => Number(b.isModerator) - Number(a.isModerator))
                .map((item) => (
                  <div
                    key={item.id}
                    className={`information-members flex w-full cursor-pointer items-center gap-[1rem] rounded-[.5rem] p-2 hover:bg-[var(--bg-color-extrathin)]
                    ${item.contact.id === info.id ? "pointer-events-none" : ""}
                    `}
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
                    <div className="relative">
                      <ImageWithLightBoxAndNoLazy
                        src={item.contact.avatar}
                        className="aspect-square w-[3rem]"
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
                    {item.isModerator ? (
                      <div
                        className="font-be-vn-bold rounded-full bg-pink-400 px-[1rem] py-[.2rem] 
                        text-sm text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                      >
                        Admin
                      </div>
                    ) : (
                      ""
                    )}
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
              <p className="font-be-vn-bold">Attachments</p>
              <div
                onClick={() => setToggle("attachment")}
                className="cursor-pointer text-pink-500 hover:text-pink-400"
              >
                View all
              </div>
            </div>
            <div className="display-attachment-container grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
              {displayAttachments.map((item, index) => (
                <ImageWithLightBoxAndNoLazy
                  src={item.mediaUrl}
                  title={item.mediaName?.split(".")[0]}
                  className={`aspect-square w-full`}
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
      </div>
    </div>
  );
};

export default Information;
