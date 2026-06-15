import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PushpinOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Suspense, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import { useMessageActions, useMessageEdit } from "../../hooks/useMessageActions";
import { usePinMessage } from "../../hooks/usePinMessage";
import { useReply } from "../../hooks/useReply";
import {
  canEditMessage,
  canRecallMessage,
} from "../../utils/messageActionHelpers";
import "../../styles/messagemenu_slide.css";
import { MessageMenuProps } from "../../types/message.types";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
import ForwardMessageModal from "./ForwardMessageModal";
import MessageMenuItem from "./MessageMenuItem";

const MessageMenu_Slide = (props: MessageMenuProps) => {
  const { conversationId, message, mine, contact } = props;

  const { data: conversations } = useConversation();
  const { data: info } = useInfo();
  const { pin, pinning } = usePinMessage(conversationId);
  const { setReply } = useReply();
  const { setEdit } = useMessageEdit();
  const { recall, processing } = useMessageActions(conversationId);

  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const [show, setShow] = useState(false);
  const [openForward, setOpenForward] = useState(false);

  const recalled = !!message.recalledTime;

  const showEdit = canEditMessage(message, mine);
  const showDelete = canRecallMessage(message, mine);

  // Tin đã recall: không render menu (tránh hover hiện action bar rỗng).
  if (recalled) return null;

  const startEdit = () =>
    setEdit({ messageId: message.id ?? "", content: message.content ?? "" });

  const onDelete = () => {
    if (!message.id) return;
    recall(message.id, info?.id ?? "");
  };

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
  useEventListener("click", hideMenuOnClick);

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
      <MessageMenuItem
        onClick={copyMessage}
        closeOnClick={false}
        tooltip="Copy message"
      >
        <CopyOutlined />
      </MessageMenuItem>
      <MessageMenuItem
        className={`${pinning ? "pointer-events-none" : ""} ${message.isPinned && !pinning ? "text-light-blue-500" : ""}`}
        onClick={() => pin(message.id ?? "", message.isPinned ?? false)}
        closeOnClick={false}
        tooltip={message.isPinned ? "Unpin message" : "Pin message"}
      >
        {pinning ? <SyncOutlined spin /> : <PushpinOutlined rotate={316} />}
      </MessageMenuItem>
      <MessageMenuItem
        onClick={replyMessage}
        closeOnClick={true}
        close={() => setShow(false)}
        tooltip="Reply message"
      >
        <i className="fa fa-reply" />
      </MessageMenuItem>
      <MessageMenuItem
        onClick={() => setOpenForward(true)}
        closeOnClick={true}
        close={() => setShow(false)}
        tooltip="Forward message"
      >
        <i className="fa fa-share" />
        <BackgroundPortal
          show={openForward}
          className="modal-size-sm"
          title="Forward message"
          onClose={() => setOpenForward(false)}
        >
          <div className="modal-content-h flex flex-col p-5">
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
