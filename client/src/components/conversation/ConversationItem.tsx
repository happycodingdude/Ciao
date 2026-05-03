import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ConversationModel } from "../../types/conv.types";
import { renderMessageWithMentions } from "../../utils/renderMention";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type Props = {
  item: ConversationModel;
  selfId?: string;
  isActive: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
};

const ConversationItem = ({ item, selfId, isActive, itemRef, onClick }: Props) => {
  // Direct chat → lấy member còn lại (không phải mình) để hiển thị avatar/tên
  const otherMember = (item.members ?? []).find((m) => m.contact?.id !== selfId);
  // Có ít nhất 1 member khác đang online → hiển thị dot xanh
  const isOnline = (item.members ?? []).some(
    (m) => m.contact?.isOnline && m.contact?.id !== selfId,
  );

  return (
    <Link to="/conversations/$conversationId" params={{ conversationId: item.id ?? "" }}>
      {/* isActive → thêm class "active" để highlight conversation đang xem */}
      <div
        ref={itemRef}
        onClick={onClick}
        className={`chat-item cursor-pointer rounded-2xl px-4 py-2 ${isActive ? "active" : ""}`}
      >
        <div className="laptop-lg:h-12 laptop:h-12 flex items-center justify-between">
          <div className="relative">
            {/* Group → avatar của group; direct chat → avatar của người kia */}
            <ImageWithLightBoxAndNoLazy
              src={item.isGroup ? item.avatar : otherMember?.contact?.avatar}
              className="pointer-events-none aspect-square w-10 animate-morph"
              circle
            />
            <div
              className={`absolute -bottom-1 -right-1 aspect-square w-4 rounded-full border-2 border-white
                ${isOnline ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
            />
          </div>
          <div className="flex w-[60%] flex-col">
            {/* Group → title của group; direct chat → tên người kia */}
            <CustomLabel
              className="font-medium"
              title={item.isGroup ? item.title : otherMember?.contact?.name}
            />
            {item.lastMessage && (
              <div className="flex text-gray-600">
                {item.hasAttachment && (
                  <span className="laptop:text-2xs mr-1 self-center text-gray-500 grayscale">
                    🖼️
                  </span>
                )}
                {/* isActive → màu mờ; unSeen → màu đỏ báo tin chưa đọc; bình thường → màu blur */}
                <p
                  className={`${
                    isActive
                      ? "text-(--text-sub-color-thin)"
                      : item.unSeen
                        ? "text-(--danger-text-color)"
                        : "text-(--text-main-color-blur)"
                  } w-full overflow-hidden text-ellipsis whitespace-nowrap`}
                >
                  {renderMessageWithMentions(item.lastMessage)}
                </p>
              </div>
            )}
          </div>
          <div
            className={`laptop:text-4xs laptop:w-7 flex aspect-square flex-col items-center justify-center self-start rounded-full
              ${item.lastMessageTime === null ? "" : "bg-gray-100"} text-gray-500`}
          >
            {/* Chưa có tin nhắn → không hiển thị badge thời gian */}
            <p>
              {item.lastMessageTime === null ? "" : dayjs(item.lastMessageTime).fromNow()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ConversationItem;
