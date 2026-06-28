import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { forwardRef } from "react";
import { toast } from "react-toastify";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { useMessageEdit } from "../../hooks/useMessageActions";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/messagecontent.css";
import "../../styles/messagemenu_slide.css";
import { MessageContentProps } from "../../types/message.types";
import {
  canEditMessage,
  isMessageDeliveredToMember,
} from "../../utils/messageActionHelpers";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import { ForwardedMessage, MessageItem, ReplyMessage } from "./MessageItem";
import MessageMenu_Slide from "./MessageMenu_Slide";

const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  (props, ref) => {
    const { message, id, showName, showAvatar, seenContacts } = props;

    const { data: info } = useInfo();
    const { setEdit } = useMessageEdit();
    const { data: conversations } = useConversation();

    const { conversationId } = Route.useParams();
    const conversation = conversations?.conversations?.find(
      (c) => c.id === conversationId,
    );

    // Tin nhắn chưa load xong hoặc bị lỗi → không render
    if (!message) return null;

    const isSelf = message.contactId === info?.id;
    const isRecalled = !!message.recalledTime;
    const isEdited = !!message.editedTime && !isRecalled;
    const showEdit = canEditMessage(message, isSelf);

    // Tin gửi lỗi chỉ cho phép copy nội dung (thao tác local, không chạm DB).
    const copyMessage = () => {
      navigator.clipboard
        .writeText(message.content ?? "")
        .then(() => toast.success("Message copied to clipboard"))
        .catch((err) => console.error("Failed to copy message: ", err));
    };

    const sender = !isSelf
      ? (conversation?.members ?? []).find(
          (q) => q.contact?.id === message.contactId,
        )
      : null;

    const SentIcon = () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#a0aec0"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M8 12.5l2.5 2.5 5.5-5.5"
          stroke="#a0aec0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    const DeliveredIcon = () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="#a0aec0"
          stroke="#a0aec0"
          strokeWidth="2"
        />
        <path
          d="M8 12.5l2.5 2.5 5.5-5.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    /**
     * Render avatar những người đã xem tin cuối của conversation.
     * Rule sản phẩm: CHỈ render khi tin nhắn CUỐI CÙNG của conversation là
     * của mình (isSelf + isLastFromMe). Tin của người khác hoặc tin của mình
     * KHÔNG phải tin cuối → không hiển thị bất kỳ icon/avatar nào.
     * Chatbox đã filter source theo rule này (map seenContactsByMessageId chỉ
     * chứa entry cho tin cuối nếu là của mình); guard dưới đây chỉ để
     * defensive nếu props bị truyền sai trong tương lai.
     */
    const renderSeenAvatars = () => {
      if (!seenContacts || seenContacts.length === 0) return null;

      // Direct chat (1 người): render 1 avatar nhỏ gọn
      if (seenContacts.length === 1) {
        const c = seenContacts[0];
        return (
          <img
            key={c.id}
            src={
              c.avatar ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(c.name || "U")
            }
            alt={c.name}
            title={c.name}
            className="h-3.5 w-3.5 rounded-full object-cover"
          />
        );
      }

      // Group chat: tối đa 3 avatar, dư thì +N
      return (
        <div className="flex items-center justify-end gap-1">
          {seenContacts.slice(0, 3).map((c) => (
            <img
              key={c.id}
              src={
                c.avatar ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(c.name || "U")
              }
              alt={c.name}
              title={c.name}
              className="h-3.5 w-3.5 rounded-full object-cover"
            />
          ))}
          {seenContacts.length > 3 && (
            <span className="text-3xs text-gray-500">
              +{seenContacts.length - 3}
            </span>
          )}
        </div>
      );
    };

    /**
     * Render icon Sent/Delivered cho tin cuối của conversation KHI CHƯA ĐƯỢC
     * AI ĐỌC.
     * - Chỉ áp dụng khi tin nhắn CUỐI CÙNG của conversation là của mình
     *   (isSelf + isLastFromMe). Nếu sau đó người khác gửi tin → status biến mất.
     * - Bị che nếu đã có avatar người xem (avatar ưu tiên hơn icon).
     * - Direct chat: phân biệt Sent vs Delivered theo lastDeliveredMessageId
     *   (ưu tiên) hoặc lastDeliveredTime horizon của đối phương.
     * - Group chat: chỉ Sent (chưa hỗ trợ Delivered theo từng member).
     */
    const renderOwnSendStatus = () => {
      if (!isSelf || !props.isLastFromMe || !conversation) return null;
      if (message.pending) return null;
      // Đã có người đọc → ưu tiên avatar, không render icon
      if (seenContacts && seenContacts.length > 0) return null;

      if (conversation.isGroup) return <SentIcon />;

      const otherMember = conversation.members?.find(
        (m) => m.contact?.id !== info?.id,
      );
      if (!otherMember) return <SentIcon />;
      if (isMessageDeliveredToMember(message, otherMember)) {
        return <DeliveredIcon />;
      }
      return <SentIcon />;
    };

    // Guard: chỉ hiển thị receipt (avatar / icon) khi tin nhắn CUỐI CÙNG của
    // conversation là của mình. `isLastFromMe` từ Chatbox đã được tính theo
    // rule này (chỉ true cho tin cuối conversation nếu là của mình & confirmed).
    const hasSeenAvatars =
      isSelf && !!props.isLastFromMe && (seenContacts?.length ?? 0) > 0;
    const showOwnStatus =
      isSelf && props.isLastFromMe && !message.pending && !hasSeenAvatars;

    return (
      <div
        ref={ref}
        id={message.id}
        key={message.id}
        // Tin của mình → căn phải (flex-row-reverse); tin người khác → căn trái
        className={`flex shrink-0 gap-4 ${isSelf ? "mr-6 flex-row-reverse" : ""} `}
      >
        {/* Avatar chỉ hiển thị cho tin người khác gửi */}
        {!isSelf && (
          <div className="aspect-square h-8 shrink-0">
            {/* Chỉ render ảnh khi đây là tin đầu tiên trong block cùng người gửi */}
            {showAvatar && sender && (
              <ImageWithLightBoxAndNoLazy
                src={sender.contact?.avatar ?? undefined}
                className="h-full w-full cursor-pointer"
                circle
                slides={[{ src: sender.contact?.avatar ?? "" }]}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* Tên người gửi: chỉ hiển thị cho tin người khác, và chỉ ở đầu block */}
          {!isSelf && showName && sender && (
            <div
              className={`text-(--text-main-color-thin) flex items-center gap-4 ${isSelf ? "justify-end" : ""}`}
            >
              <p className="font-medium">{sender.contact?.name}</p>
            </div>
          )}

          <div
            className={`laptop-lg:max-w-120 laptop:max-w-100 desktop:max-w-220 relative flex w-fit flex-col
            ${isSelf ? "items-end" : "items-start"}
            ${(message.attachments?.length ?? 0) > 0 ? "gap-2" : ""}
          `}
          >
            <div className="peer flex w-full flex-col">
              <div
                className={`flex! overflow-visible! relative w-fit max-w-full cursor-pointer
                  flex-col gap-2 whitespace-pre-line break-all rounded-xl
                  ${message.pending ? "opacity-50" : ""}
                  ${isRecalled || message.content || message.isForwarded || message.replyId ? "laptop-lg:py-2 laptop:py-2 laptop:px-4 laptop-lg:px-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]" : ""}
                `}
              >
                {/* Recalled: placeholder italic, ẩn nội dung/attachment/reply gốc */}
                {isRecalled ? (
                  <p className="italic text-gray-400">
                    Tin nhắn đã được thu hồi
                  </p>
                ) : message.isForwarded ? (
                  <ForwardedMessage
                    message={message.content ?? ""}
                    contact={
                      // "You" cho tin của mình; tên người gửi gốc cho tin forward từ người khác
                      isSelf
                        ? "You"
                        : ((conversation?.members ?? []).find(
                            (q) => q.contact?.id === message.contactId,
                          )?.contact?.name ?? "")
                    }
                    mine={isSelf}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                ) : message.replyId && message.replyContent ? (
                  // Có replyId và replyContent → đây là tin reply
                  <ReplyMessage
                    message={message.content ?? ""}
                    replyId={message.replyId}
                    replyContent={message.replyContent}
                    contact={
                      (conversation?.members ?? []).find(
                        (q) => q.contact?.id === message.replyContact,
                      )?.contact?.name ?? ""
                    }
                    mine={isSelf}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                ) : (
                  // Tin nhắn thông thường
                  <MessageItem
                    message={message.content ?? ""}
                    contact={
                      // pinnedBy: tên người ghim (dùng để hiển thị tooltip "pinned by ...")
                      (conversation?.members ?? []).find(
                        (q) => q.contact?.id === message.pinnedBy,
                      )?.contact?.name ?? ""
                    }
                    mine={isSelf}
                    isPinned={message.isPinned}
                    attachments={message.attachments}
                  />
                )}
              </div>
            </div>

            {/* Badge ghim: vị trí lệch theo bên trái/phải tùy là tin của mình hay người khác */}
            {message.isPinned && !isRecalled && (
              <div
                className={`laptop:h-5.5 laptop:rounded-md laptop-lg:h-6 laptop-lg:rounded-lg absolute -top-2 flex aspect-square items-center justify-center bg-light-blue-500 shadow-md
                  ${isSelf ? "-right-3" : "-left-[.8rem]"}`}
              >
                <i className="fa-solid fa-thumbtack laptop-lg:text-2xs laptop:text-3xs text-white"></i>
              </div>
            )}

            {/* Badge "đã chỉnh sửa": icon bút chì nổi ở góc trên bubble, cùng góc
                với badge ghim. Nếu tin vừa ghim vừa edit → đẩy badge này vào trong
                để nằm cạnh badge ghim (ghim ngoài cùng), tránh đè lên nhau. */}
            {isEdited && (
              <div
                title="Đã chỉnh sửa"
                className={`laptop:h-5.5 laptop:rounded-md laptop-lg:h-6 laptop-lg:rounded-lg absolute -top-2 flex aspect-square items-center justify-center bg-gray-400 shadow-md
                  ${
                    isSelf
                      ? message.isPinned
                        ? "right-[1.15rem]"
                        : "-right-3"
                      : message.isPinned
                        ? "left-[1.15rem]"
                        : "-left-[.8rem]"
                  }`}
              >
                <i className="fa-solid fa-pen laptop-lg:text-2xs laptop:text-3xs text-white"></i>
              </div>
            )}

            {/* Tin gửi lỗi: KHÔNG cho menu chức năng (edit/pin/reply/forward/delete)
                vì message chưa tồn tại trong DB → chỉ hiện đúng 1 nút copy. */}
            {message.failed && isSelf && (
              <button
                type="button"
                data-mine={isSelf}
                className="message-copy-btn"
                title="Copy message"
                onClick={(e) => {
                  e.stopPropagation();
                  copyMessage();
                }}
              >
                <CopyOutlined />
              </button>
            )}

            {/* Tin đã recall: chỉ hiện thời gian khi hover, không có menu/edit */}
            {!message.pending && !message.failed && !isRecalled && showEdit && (
              <button
                type="button"
                className="message-edit-btn"
                title="Edit message"
                onClick={(e) => {
                  e.stopPropagation();
                  setEdit({
                    messageId: message.id ?? "",
                    content: message.content ?? "",
                  });
                }}
              >
                <EditOutlined />
              </button>
            )}
            {!message.pending && !message.failed && !isRecalled && (
              <MessageMenu_Slide
                conversationId={id}
                message={message}
                mine={isSelf}
                contact={
                  (conversation?.members ?? []).find(
                    (q) => q.contact?.id === message.contactId,
                  )?.contact ?? {}
                }
                getContainerRect={props.getContainerRect}
              />
            )}
            {/*
              QUAN TRỌNG: <p.message-time> PHẢI là sibling trực tiếp của .peer
              (và .message-menu-container) để selector CSS
              `.peer:hover ~ .message-time` hoạt động.
              Không được bọc trong wrapper div, nếu không hover sẽ mất tác dụng.
            */}
            <p
              data-mine={isSelf}
              data-recalled={isRecalled}
              className="message-time"
            >
              {dayjs(message.createdTime).format("HH:mm")}
            </p>
          </div>

          {/* Gửi lỗi: đặt NGOÀI khối .relative (anchor của .message-time) để dòng
              chữ lỗi không đẩy lệch vị trí thời gian — thời gian vẫn neo theo bubble
              như tin gửi thành công. */}
          {message.failed && isSelf && (
            <p className="text-2xs flex items-center justify-end text-red-500">
              <i className="fa fa-circle-exclamation mr-1" />
              Gửi lỗi
            </p>
          )}

          {/*
            Receipt area: CHỈ render khi tin CUỐI CÙNG của conversation là của
            mình (isSelf && isLastFromMe).
            - Đối phương đã đọc tin cuối này → render avatar (ưu tiên).
            - Chưa ai đọc → fallback Sent/Delivered icon.
            Mọi trường hợp khác (tin người khác, tin của mình không phải tin cuối,
            hoặc tin cuối là của người khác): không render gì.
          */}
          {hasSeenAvatars && (
            <div className="text-3xs flex justify-end italic text-gray-500">
              {renderSeenAvatars()}
            </div>
          )}

          {showOwnStatus && (
            <div className="text-3xs flex justify-end italic text-gray-500">
              {renderOwnSendStatus()}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default MessageContent;
