import { MouseEvent, useRef, useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { ConversationModel } from "../../types/conv.types";
import { ContactModel } from "../../types/friend.types";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import OnlineStatusDot from "../common/OnlineStatusDot";
import QuickChat from "../friend/QuickChat";

type Props = {
  conversation: ConversationModel;
  selfId?: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
};

const InformationMembers = ({ conversation, selfId, panelRef }: Props) => {
  const [showMembers, setShowMembers] = useLocalStorage("showMembers", true);
  const [chosenProfile, setChosenProfile] = useState<ContactModel>();
  const [quickChatRect, setQuickChatRect] = useState<DOMRect>();
  const [informationOffsetWidth, setInformationOffsetWidth] = useState<number>();
  const refMembers = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-medium">Members ({(conversation.members ?? []).length})</p>
        <i
          data-show={showMembers}
          className="fa-arrow-down fa-solid base-icon-sm flex aspect-square h-full cursor-pointer items-center justify-center
          transition-all duration-500 data-[show=false]:rotate-90"
          onClick={() => setShowMembers((v) => !v)}
        ></i>
      </div>
      <div
        ref={refMembers}
        data-show={showMembers}
        className="members-image-container hide-scrollbar laptop:max-h-50 desktop:max-h-200 phone:max-h-80 flex flex-col gap-2 overflow-y-auto
          scroll-smooth transition-all duration-500 data-[show=false]:max-h-0 data-[show=false]:opacity-0 data-[show=true]:opacity-100"
      >
        {[...(conversation.members ?? [])]
          // Admin luôn hiển thị trước
          .sort((a, b) => Number(b.isModerator) - Number(a.isModerator))
          .map((item) => (
            <div
              key={item.id}
              className={`information-members hover:bg-(--bg-color-extrathin) flex w-full cursor-pointer items-center gap-4 rounded-lg p-2
              // Tắt click cho chính mình (không cần QuickChat với bản thân)
              ${item.contact?.id === selfId ? "pointer-events-none" : ""}`}
              onClick={(e: MouseEvent<HTMLElement>) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setQuickChatRect(rect);
                // Lưu độ rộng panel để tính vị trí hiển thị QuickChat bên ngoài panel
                setInformationOffsetWidth(panelRef.current?.offsetWidth);
                setChosenProfile({
                  id: item.contact?.id,
                  avatar: item.contact?.avatar,
                  isOnline: item.contact?.isOnline,
                  name: item.contact?.name,
                  friendId: item.friendId,
                  // "friend" → không có nút add friend (đã là bạn); các status khác → hiện CTA
                  friendStatus:
                    item.friendStatus === "friend" ? undefined : item.friendStatus ?? undefined,
                  directConversation: item.directConversation,
                });
              }}
            >
              <div className="relative">
                <ImageWithLightBoxAndNoLazy
                  src={item.contact?.avatar}
                  className="aspect-square h-8"
                  circle
                  slides={[{ src: item.contact?.avatar ?? "" }]}
                  onClick={() => {}}
                />
                <OnlineStatusDot
                  className="right-[-20%] top-[-10%]"
                  online={item.contact?.isOnline}
                />
              </div>
              <CustomLabel title={item.contact?.name} />
              {item.isModerator && (
                <div className="text-3xs bg-linear-to-br rounded-full from-light-blue-300 to-light-blue-500 px-4 py-1 font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                  Admin
                </div>
              )}
            </div>
          ))}
      </div>
      <QuickChat
        profile={chosenProfile}
        rect={quickChatRect}
        offset={informationOffsetWidth}
        onClose={() => setChosenProfile(undefined)}
      />
    </div>
  );
};

export default InformationMembers;
