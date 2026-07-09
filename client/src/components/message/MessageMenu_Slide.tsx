import {
  BookOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PushpinOutlined,
  ShareAltOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Suspense, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useBookmark } from "../../hooks/useBookmark";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import {
  useMessageActions,
  useMessageEdit,
} from "../../hooks/useMessageActions";
import { usePinMessage } from "../../hooks/usePinMessage";
import { useReply } from "../../hooks/useReply";
import { useTranslation } from "../../hooks/useTranslation";
import "../../styles/messagemenu_slide.css";
import { MessageMenuProps } from "../../types/message.types";
import {
  canEditMessage,
  canRecallMessage,
} from "../../utils/messageActionHelpers";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
import ForwardMessageModal from "./ForwardMessageModal";
import MessageMenuItem from "./MessageMenuItem";

const MessageMenu_Slide = (props: MessageMenuProps) => {
  const { conversationId, message, mine, contact, onlyDelete } = props;

  const { data: conversations } = useConversation();
  const { data: info } = useInfo();
  const { pin, pinning } = usePinMessage(conversationId);
  const { isBookmarked, toggle: toggleBookmark, saving } = useBookmark(conversationId);
  const { setReply } = useReply();
  const { setEdit } = useMessageEdit();
  const { recall, processing } = useMessageActions(conversationId);
  const { translate } = useTranslation();

  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const [show, setShow] = useState(false);
  const [openForward, setOpenForward] = useState(false);
  const refMenu = useRef<HTMLDivElement>(null);

  const hideMenuOnClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (
      target.classList.contains("message-menu-container") ||
      target.classList.contains("message-menu-item")
    )
      return;
    setShow(false);
  }, []);
  // QUAN TRỌNG: mọi Hook (useRef/useCallback/useEventListener) PHẢI đứng TRƯỚC các early
  // return bên dưới. Nếu để sau, khi tin chuyển sang trạng thái ẩn menu (vd: tin chỉ-là-link
  // của người khác → onlyDelete && !showDelete, hoặc tin bị recall) số hook gọi ở lần render
  // sau sẽ ÍT hơn lần trước → React lỗi "Rendered fewer hooks than expected" và crash cả view.
  useEventListener("click", hideMenuOnClick);

  const recalled = !!message.recalledTime;

  const showEdit = canEditMessage(message, mine);
  const showDelete = canRecallMessage(message, mine);

  // Tin đã recall: không render menu (tránh hover hiện action bar rỗng).
  if (recalled) return null;
  // Tin chỉ-là-link + không được phép xoá → không còn action nào → ẩn hẳn menu.
  if (onlyDelete && !showDelete) return null;

  const startEdit = () =>
    setEdit({ messageId: message.id ?? "", content: message.content ?? "" });

  const onDelete = () => {
    if (!message.id) return;
    recall(message.id, info?.id ?? "");
  };

  const copyMessage = () => {
    if (!message) return;
    navigator.clipboard
      .writeText(message.content ?? "")
      .then(() => toast.success("Message copied to clipboard"))
      .catch((err) => console.error("Failed to copy message: ", err));
  };

  const replyMessage = () => {
    setReply({
      replyId: message.id,
      replyContact: mine ? info?.id : (contact as any)?.id,
      replyContactName: mine ? info?.name : (contact as any)?.name,
      replyContent: message.content || "",
    });
  };

  return (
    <div
      ref={refMenu}
      data-show={show}
      data-mine={mine}
      className="message-menu-container shadow-md"
    >
      {/* Tin chỉ-là-link: ẩn toàn bộ action ngoài Xoá. */}
      {!onlyDelete && (
        <>
      {showEdit && (
        <MessageMenuItem
          onClick={startEdit}
          closeOnClick={true}
          close={() => setShow(false)}
          tooltip="Edit message"
        >
          <EditOutlined />
        </MessageMenuItem>
      )}
      {/* Copy chỉ áp dụng cho tin văn bản — content của contact/sticker/gif/media
          không phải text hữu ích để copy. */}
      {message.type === "text" && (
        <MessageMenuItem
          onClick={copyMessage}
          closeOnClick={false}
          tooltip="Copy message"
        >
          <CopyOutlined />
        </MessageMenuItem>
      )}
      <MessageMenuItem
        className={`${pinning ? "pointer-events-none" : ""} ${message.isPinned && !pinning ? "text-light-blue-500" : ""}`}
        onClick={() => pin(message.id ?? "", message.isPinned ?? false)}
        closeOnClick={false}
        tooltip={message.isPinned ? "Unpin message" : "Pin message"}
      >
        {pinning ? <SyncOutlined spin /> : <PushpinOutlined rotate={316} />}
      </MessageMenuItem>
      {/* Bookmark riêng tư (Phase 3): lưu tin để xem lại ở trang "Tin đã lưu". */}
      <MessageMenuItem
        className={`${saving ? "pointer-events-none" : ""} ${isBookmarked(message.id) && !saving ? "text-orange-500" : ""}`}
        onClick={() => toggleBookmark(message.id ?? "", isBookmarked(message.id))}
        closeOnClick={false}
        tooltip={isBookmarked(message.id) ? "Bỏ lưu tin nhắn" : "Lưu tin nhắn"}
      >
        {saving ? <SyncOutlined spin /> : <BookOutlined />}
      </MessageMenuItem>
      <MessageMenuItem
        onClick={replyMessage}
        closeOnClick={true}
        close={() => setShow(false)}
        tooltip="Reply message"
      >
        <i className="fa fa-reply" />
      </MessageMenuItem>
      {/* Dịch: chỉ áp dụng cho tin văn bản có nội dung. */}
      {message.type === "text" && !!message.content && (
        <MessageMenuItem
          onClick={() => translate(message.id ?? "", message.content ?? "")}
          closeOnClick={true}
          close={() => setShow(false)}
          tooltip="Dịch"
        >
          <i className="fa fa-language" />
        </MessageMenuItem>
      )}
      <MessageMenuItem
        onClick={() => setOpenForward(true)}
        closeOnClick={true}
        close={() => setShow(false)}
        tooltip="Forward message"
      >
        <i className="fa fa-share" />
        <BackgroundPortal
          show={openForward}
          className="modal-size-md"
          title="Forward message"
          description="Send this message to your friends"
          icon={<ShareAltOutlined />}
          onClose={() => setOpenForward(false)}
        >
          <div className="text-(--text-main-color) modal-content-h flex flex-col gap-5 px-6 pb-6 pt-2">
            <Suspense fallback={<ModalLoading />}>
              <ForwardMessageModal
                message={message}
                forward={true}
                directContact={
                  !conversation?.isGroup
                    ? (conversation?.members ?? []).find(
                        (item) => item.contact?.id !== info?.id,
                      )?.contact?.id
                    : undefined
                }
              />
            </Suspense>
          </div>
        </BackgroundPortal>
      </MessageMenuItem>
        </>
      )}
      {showDelete && (
        <MessageMenuItem
          className={processing ? "pointer-events-none" : ""}
          onClick={onDelete}
          closeOnClick={true}
          close={() => setShow(false)}
          tooltip="Delete message"
        >
          {processing ? <SyncOutlined spin /> : <DeleteOutlined />}
        </MessageMenuItem>
      )}
    </div>
  );
};

export default MessageMenu_Slide;
