import { CloseOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useParams } from "@tanstack/react-router";
import { MouseEvent, Suspense, useEffect, useRef, useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import ModalLoading from "../../../components/ModalLoading";
import OnlineStatusDot from "../../../components/OnlineStatusDot";
import { useSignal } from "../../../context/SignalContext";
import useLocalStorage from "../../../hooks/useLocalStorage";
import "../../../information.css";
import { UserProfile } from "../../../types";
import useInfo from "../../authentication/hooks/useInfo";
import AddMembers, {
  AddMembersProps,
} from "../../chatbox/components/AddMembers";
import ForwardMessageModal from "../../chatbox/components/ForwardMessageModal";
import UpdateConversation from "../../chatbox/components/UpdateConversation";
import useChatDetailToggles from "../../chatbox/hooks/useChatDetailToggles";
import QuickChat from "../../friend/components/QuickChat";
import { ContactModel } from "../../friend/types";
import useConversation from "../../listchat/hooks/useConversation";
import { AttachmentModel } from "../../listchat/types";
import useAttachment from "../hooks/useAttachment";

const Information = () => {
  const { startLocalStream } = useSignal();

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
  const refAddMembers = useRef<AddMembersProps>();

  const [displayAttachments, setDisplayAttachments] = useState<
    AttachmentModel[]
  >([]);
  const [chosenProfile, setChosenProfile] = useState<ContactModel>();
  const [quickChatRect, setQuickChatRect] = useState<DOMRect>();
  const [informationoffsetWidth, setInformationoffsetWidth] =
    useState<number>();
  const [openUpdateTitle, setOpenUpdateTitle] = useState<boolean>(false);
  const [forwardingItem, setForwardingItem] = useState(null);

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

  const toggleMembers = () => {
    setShowMembers((current) => !current);
  };

  const leaveGroup = () => {
    // Logic to leave the group
  };

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 pb-4 ${toggle === "information" ? "z-10" : "z-0"} hide-scrollbar flex h-full w-full flex-col overflow-y-auto bg-white`}
    >
      {/* Container */}
      <div className="[&>*:not(:last-child)]:border-b-(--border-color) flex grow flex-col *:p-4 [&>*:not(:last-child)]:border-b-[.1rem]">
        <div className="flex items-center justify-between px-4 laptop:h-16">
          <p className="text-base font-medium">Chat information</p>
          <div className="flex gap-4">
            {/* <EditOutlined
              className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
              onClick={() => {
                if (conversation.isGroup) setOpenUpdateTitle(true);
              }}
            /> */}
            {/* MARK: UPDATE TITLE  */}
            {conversation.isGroup ? (
              <div
                className="fa fa-pen-to-square base-icon-sm hover:text-light-blue-500"
                onClick={() => setOpenUpdateTitle(true)}
              ></div>
            ) : null}

            <BackgroundPortal
              show={openUpdateTitle}
              className="phone:w-140 laptop:w-140 desktop:w-[35%]"
              title="Update group"
              onClose={() => setOpenUpdateTitle(false)}
            >
              <UpdateConversation
                selected={conversation}
                onClose={() => setOpenUpdateTitle(false)}
              />
            </BackgroundPortal>
            <CloseOutlined
              className="base-icon-sm cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent bubbling to parent
                setToggle(null);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
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
            className="relative aspect-square w-20 cursor-pointer"
            circle
          />
          {/* MARK: TITLE  */}
          <div className="flex w-[70%] grow flex-col items-center justify-center gap-2 laptop:text-base">
            <CustomLabel
              className="text-center font-medium"
              title={
                conversation?.isGroup
                  ? conversation.title
                  : conversation.members?.find(
                      (item) => item.contact.id !== info.id,
                    )?.contact.name
              }
              tooltip
            />
          </div>
          {/* MARK: CONVERSATION ACTION */}
          <div className="conversation-action-container">
            {conversation.isGroup ? (
              <div
                className="conversation-action"
                onClick={() => refAddMembers.current?.open()}
              >
                <AddMembers ref={refAddMembers} />
              </div>
            ) : (
              ""
            )}
            <div
              className="conversation-action"
              onClick={() =>
                startLocalStream(
                  conversation.members.find((mem) => mem.contact.id !== info.id)
                    .contact as UserProfile,
                )
              }
            >
              <VideoCameraOutlined className="base-icon-sm transition-all duration-200" />
            </div>
            {conversation.isGroup ? (
              <div
                className="conversation-action fa fa-right-from-bracket"
                onClick={leaveGroup}
              ></div>
            ) : (
              ""
            )}
          </div>
        </div>
        {/* MARK: MEMBERS  */}
        {conversation?.isGroup ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="font-medium">
                Members ({conversation.members.length})
              </p>
              <i
                data-show={showMembers}
                className="fa-arrow-down fa-solid base-icon-sm flex aspect-square h-full cursor-pointer items-center justify-center 
                transition-all duration-500 data-[show=false]:rotate-90"
                onClick={toggleMembers}
              ></i>
            </div>
            {/* Still don't know why scrolling not working without adding h-0 */}
            <div
              ref={refMembers}
              data-show={showMembers}
              className="members-image-container hide-scrollbar laptop-lg:max-h-100 desktop:max-h-200 flex flex-col gap-2 overflow-y-auto scroll-smooth
                transition-all duration-500 data-[show=false]:max-h-0 data-[show=false]:opacity-0 data-[show=true]:opacity-100 phone:max-h-80"
            >
              {[...conversation?.members]
                .sort((a, b) => Number(b.isModerator) - Number(a.isModerator))
                .map((item) => (
                  <div
                    key={item.id}
                    className={`information-members hover:bg-(--bg-color-extrathin) flex w-full cursor-pointer items-center gap-4 rounded-lg p-2
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
                        directConversation: item.directConversation,
                      });
                    }}
                  >
                    <div className="relative">
                      <ImageWithLightBoxAndNoLazy
                        src={item.contact.avatar}
                        className="aspect-square w-10"
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
                      <div className="text-3xs bg-linear-to-br rounded-full from-light-blue-300 to-light-blue-500 px-4 py-1 font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                        Admin
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
            </div>

            {/* MARK: MEMBER QUICK CHAT  */}
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

        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <p className="font-medium">Attachments</p>
            <div
              onClick={() => setToggle("attachment")}
              className="cursor-pointer text-light-blue-500 hover:text-light-blue-400"
            >
              View all
            </div>
          </div>
          {displayAttachments.length !== 0 ? (
            <>
              <div className="display-attachment-container grid w-full grid-cols-[repeat(4,1fr)] gap-4">
                {displayAttachments.map((item, index) => (
                  <div className="relative">
                    <ImageWithLightBoxAndNoLazy
                      src={item.mediaUrl}
                      title={item.mediaName?.split(".")[0]}
                      className={`peer aspect-square w-full`}
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
                    <div
                      className="absolute right-1 top-1 z-10 aspect-square w-5 cursor-pointer 
                    rounded-sm bg-white opacity-0 hover:opacity-100 peer-hover:opacity-100"
                      onClick={() => setForwardingItem(item)}
                    ></div>
                  </div>
                ))}
              </div>

              {forwardingItem && (
                <BackgroundPortal
                  show={forwardingItem}
                  className="laptop:w-100 phone:w-80 desktop:w-[35%]"
                  title="Forward message"
                  onClose={() => setForwardingItem(null)}
                >
                  <div className="phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col p-5">
                    <Suspense fallback={<ModalLoading />}>
                      <ForwardMessageModal
                        message={{
                          type: "media",
                          attachments: [forwardingItem],
                        }}
                      />
                    </Suspense>
                  </div>
                </BackgroundPortal>
              )}
            </>
          ) : (
            <div className="bg-size-[100%] bg-position-[center_center] aspect-square w-20 self-center bg-[url('/src/assets/emptybox.svg')] bg-no-repeat"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Information;
