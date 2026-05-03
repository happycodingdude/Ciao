import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { forwardRef } from "react";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/messagecontent.css";
import { MessageContentProps } from "../../types/message.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import { ForwardedMessage, MessageItem, ReplyMessage } from "./MessageItem";
import MessageMenu_Slide from "./MessageMenu_Slide";

const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  (props, ref) => {
    const { message, id, showName, showAvatar } = props;

    const queryClient = useQueryClient();

    const { data: info } = useInfo();
    const { data: conversations } = useConversation();

    const { conversationId } = Route.useParams();
    const conversation = conversations?.conversations?.find(
      (c) => c.id === conversationId,
    );

    // Tin nhắn chưa load xong hoặc bị lỗi → không render
    if (!message) return null;

    const isSelf = message.contactId === info?.id;

    // Chỉ tìm sender cho tin người khác gửi; tin của mình không cần hiển thị avatar/tên
    const sender = !isSelf
      ? (conversation?.members ?? []).find(
          (q) => q.contact?.id === message.contactId,
        )
      : null;

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

        <div className="flex flex-col gap-2">
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
                  ${message.content || message.isForwarded || message.replyId ? "laptop-lg:py-2 laptop:py-2 laptop:px-4 laptop-lg:px-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]" : ""}
                `}
              >
                {/* Ưu tiên render theo loại tin: forwarded > reply > tin thường */}
                {message.isForwarded ? (
                  <ForwardedMessage
                    message={message.content ?? ""}
                    contact={
                      // "You" cho tin của mình; tên người gửi gốc cho tin forward từ người khác
                      isSelf
                        ? "You"
                        : (conversation?.members ?? []).find(
                            (q) => q.contact?.id === message.contactId,
                          )?.contact?.name ?? ""
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
            {message.isPinned && (
              <div
                className={`laptop:h-5.5 laptop:rounded-md laptop-lg:h-6 laptop-lg:rounded-lg absolute -top-2 flex aspect-square items-center justify-center bg-light-blue-500 shadow-md
                  ${isSelf ? "-right-3" : "-left-[.8rem]"}`}
              >
                <i className="fa-solid fa-thumbtack laptop-lg:text-2xs laptop:text-3xs text-white"></i>
              </div>
            )}

            {/* Context menu chỉ hiện khi tin đã confirmed (không pending) */}
            {!message.pending && (
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
            <p
              data-mine={isSelf}
              className="message-time"
            >
              {dayjs(message.createdTime).format("HH:mm")}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

export default MessageContent;
