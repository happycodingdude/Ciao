import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { useDrafts } from "../../hooks/useDraft";
import { usePinConversation } from "../../hooks/usePinConversation";
import { ConversationModel } from "../../types/conv.types";
import { renderMessageWithMentions } from "../../utils/renderMention";
import ConversationItemMenu from "./ConversationItemMenu";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type Props = {
  item: ConversationModel;
  selfId?: string;
  isActive: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
};

const ConversationItem = ({
  item,
  selfId,
  isActive,
  itemRef,
  onClick,
}: Props) => {
  // Direct chat → lấy member còn lại (không phải mình) để hiển thị avatar/tên
  const otherMember = (item.members ?? []).find(
    (m) => m.contact?.id !== selfId,
  );
  // Có ít nhất 1 member khác đang online → hiển thị dot xanh
  const isOnline = (item.members ?? []).some(
    (m) => m.contact?.isOnline && m.contact?.id !== selfId,
  );

  // Còn nội dung soạn dở → hiển thị chỉ báo "Bản nháp" thay cho preview tin cuối.
  const { drafts } = useDrafts();
  const draft = drafts[item.id ?? ""];

  // Favorites (per-user): đọc pinnedTime trên member của chính mình
  // (BE giữ nguyên field pinnedTime — chỉ đổi khái niệm/UI thành Favorites).
  const selfMember = (item.members ?? []).find((m) => m.contact?.id === selfId);
  const favorited = !!selfMember?.pinnedTime;
  const { togglePin, pinning } = usePinConversation();

  // Menu ba chấm đang mở → giữ nút ba chấm hiển thị, ẩn badge thời gian (không phụ thuộc hover)
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Link
      to="/conversations/$conversationId"
      params={{ conversationId: item.id ?? "" }}
    >
      {/* isActive → thêm class "active" để highlight conversation đang xem.
          menuOpen → thêm "menu-open" để giữ hiệu ứng hover khi menu ba chấm đang mở
          (backdrop của popover che chuột → :hover mất nếu không có class này). */}
      <div
        ref={itemRef}
        onClick={onClick}
        className={`chat-item group relative cursor-pointer rounded-2xl p-2 ${isActive ? "active" : ""} ${menuOpen ? "menu-open" : ""}`}
      >
        {/* Menu ba chấm (hiện khi hover) — chứa các hành động với hội thoại */}
        <ConversationItemMenu
          favorited={favorited}
          pinning={pinning}
          onToggleFavorite={() => togglePin(item.id ?? "", favorited)}
          onOpenChange={setMenuOpen}
        />
        <div className="laptop-lg:h-12 laptop:h-12 flex items-center justify-between">
          <div className="relative">
            {/* Group → avatar của group; direct chat → avatar của người kia */}
            <ImageWithLightBoxAndNoLazy
              src={item.isGroup ? item.avatar : otherMember?.contact?.avatar}
              className="pointer-events-none aspect-square w-10 animate-morph"
              circle
            />
            <div
              className={`border-(--bg-color) absolute -bottom-1 -right-1 aspect-square w-4 rounded-full border-2
                ${isOnline ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
            />
          </div>
          <div className="flex w-[60%] flex-col">
            {/* Group → title của group; direct chat → tên người kia */}
            <CustomLabel
              className="font-medium"
              title={item.isGroup ? item.title : otherMember?.contact?.name}
            />
            {draft ? (
              <div className="text-(--text-main-color-blur) flex">
                <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-(--danger-text-color) mr-1 font-medium">
                    Bản nháp:
                  </span>
                  {draft}
                </p>
              </div>
            ) : (
              item.lastMessage && (
              <div className="text-(--text-main-color-blur) flex">
                {item.hasAttachment && (
                  <span className="laptop:text-2xs text-(--text-main-color-blur) mr-1 self-center grayscale">
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
              )
            )}
          </div>
          {/* Badge thời gian ẩn khi hover để nhường chỗ cho nút menu ba chấm */}
          <div
            className={`laptop:text-4xs laptop:w-7 flex aspect-square flex-col items-center justify-center self-start rounded-full transition-opacity group-hover:opacity-0
              ${menuOpen ? "opacity-0" : ""} ${item.lastMessageTime === null ? "" : "bg-(--bg-color-extrathin)"} text-(--text-main-color-blur)`}
          >
            {/* Chưa có tin nhắn → không hiển thị badge thời gian */}
            <p>
              {item.lastMessageTime === null
                ? ""
                : dayjs(item.lastMessageTime).fromNow()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ConversationItem;
