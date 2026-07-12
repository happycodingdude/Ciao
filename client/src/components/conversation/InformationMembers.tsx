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

  // Admin luôn hiển thị trước — dùng chung cho cả danh sách đầy đủ lẫn dải
  // avatar xếp chồng khi thu gọn. Đợt 2b: chỉ thành viên ACTIVE — người đã
  // rời nhóm không hiển thị và không tính vào sĩ số.
  const members = (conversation.members ?? [])
    .filter((m) => !m.isDeleted)
    .sort((a, b) => Number(b.isModerator) - Number(a.isModerator));

  // Thu gọn: tối đa 5 avatar xếp chồng, từ người thứ 6 trở đi gộp thành vòng "+N"
  const MAX_STACK = 5;
  const stackMembers = members.slice(0, MAX_STACK);
  const overflowCount = members.length - MAX_STACK;

  return (
    <div className="flex flex-col gap-4">
      {/* min-h-8 = đúng chiều cao avatar dải thu gọn → hàng tiêu đề cao bằng nhau
          ở cả 2 trạng thái, toggle không bị xô lệch layout */}
      <div className="min-h-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-medium">Members ({members.length})</p>
          {/* Thu gọn: dải avatar tròn xếp chồng NGANG HÀNG cạnh tiêu đề (vòng sau
              nằm DƯỚI vòng trước, chỉ lộ 1/2) — bấm vào để mở lại danh sách đầy đủ.
              Viền ring màu nền panel để tách các vòng chồng nhau. */}
          {!showMembers && (
            <div
              className="flex cursor-pointer items-center"
              onClick={() => setShowMembers(true)}
            >
              {stackMembers.map((item, index) => (
                <div
                  key={item.id}
                  className="relative -ml-4 rounded-full ring-2 ring-(--bg-color) first:ml-0"
                  // Vòng trước đè lên vòng sau → z-index giảm dần theo thứ tự
                  style={{ zIndex: stackMembers.length - index }}
                >
                  <ImageWithLightBoxAndNoLazy
                    src={item.contact?.avatar}
                    title={item.contact?.name}
                    className="aspect-square h-8"
                    circle
                    slides={[{ src: item.contact?.avatar ?? "" }]}
                    onClick={() => setShowMembers(true)}
                  />
                </div>
              ))}
              {overflowCount > 0 && (
                <div
                  className="text-2xs bg-(--bg-color-extrathin) relative -ml-4 flex aspect-square h-8 items-center
                    justify-center rounded-full font-medium ring-2 ring-(--bg-color)"
                  style={{ zIndex: 0 }}
                  title={`${overflowCount} thành viên khác`}
                >
                  +{overflowCount}
                </div>
              )}
            </div>
          )}
        </div>
        <i
          data-show={showMembers}
          className="fa-arrow-down fa-solid base-icon-sm flex aspect-square cursor-pointer items-center justify-center
          transition-all duration-500 data-[show=false]:rotate-90"
          onClick={() => setShowMembers((v) => !v)}
        ></i>
      </div>
      <div
        ref={refMembers}
        data-show={showMembers}
        className="members-image-container hide-scrollbar laptop:max-h-50 desktop:max-h-200 phone:max-h-80 flex flex-col overflow-y-auto
          scroll-smooth transition-all duration-500 data-[show=false]:max-h-0 data-[show=false]:opacity-0 data-[show=true]:opacity-100"
      >
        {members.map((item) => (
            <div
              key={item.id}
              // pointer-events-none cho chính mình: không cần QuickChat với bản thân
              className={`information-members hover:bg-(--bg-color-extrathin) flex w-full cursor-pointer items-center gap-4 rounded-lg p-2 ${item.contact?.id === selfId ? "pointer-events-none" : ""}`}
              onClick={(e: MouseEvent<HTMLElement>) => {
                // currentTarget = cả hàng member; dùng target sẽ lấy nhầm rect của phần
                // tử con (avatar/tên/badge) khi bấm trúng, làm thẻ QuickChat neo lệch.
                const rect = e.currentTarget.getBoundingClientRect();
                setQuickChatRect(rect);
                // Lưu độ rộng panel để tính vị trí hiển thị QuickChat bên ngoài panel
                setInformationOffsetWidth(panelRef.current?.offsetWidth);
                setChosenProfile({
                  id: item.contact?.id,
                  avatar: item.contact?.avatar,
                  isOnline: item.contact?.isOnline,
                  name: item.contact?.name,
                  isModerator: item.isModerator,
                  friendId: item.friendId,
                  // "friend" → không có nút add friend (đã là bạn); các status khác → hiện CTA
                  friendStatus:
                    item.friendStatus === "friend" ? undefined : item.friendStatus ?? undefined,
                });
              }}
            >
              <div className="relative">
                <ImageWithLightBoxAndNoLazy
                  src={item.contact?.avatar}
                  className="aspect-square h-8"
                  circle
                  slides={[{ src: item.contact?.avatar ?? "" }]}
                  onClick={() => { }}
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
