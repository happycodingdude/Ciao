import {
  CopyOutlined,
  EllipsisOutlined,
  PushpinOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import React, { Suspense, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import { usePinMessage } from "../../hooks/usePinMessage";
import { useReply } from "../../hooks/useReply";
import "../../styles/messagemenu.css";
import { MessageMenuProps } from "../../types/message.types";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
import ForwardMessageModal from "./ForwardMessageModal";
import MessageMenuItem from "./MessageMenuItem";

const MessageMenu = (props: MessageMenuProps) => {
  const { conversationId, id, message, mine, pinned, contact, getContainerRect } = props;

  const { data: info } = useInfo();
  const { pin, pinning } = usePinMessage(conversationId);
  const { setReply } = useReply();

  const [show, setShow] = useState(false);
  const [openForward, setOpenForward] = useState(false);

  const refMenu = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài, nhưng giữ nguyên nếu click vào menu item (để cho item xử lý trước)
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
    // Không làm gì nếu message rỗng
    if (!message) return;
    navigator.clipboard
      .writeText(message as string)
      .then(() => toast.success("Message copied to clipboard"))
      .catch((err) => console.error("Failed to copy message: ", err));
  };

  const replyMessage = () => {
    setReply({
      replyId: id,
      // Tin của mình → dùng id/tên của mình; tin người khác → dùng id/tên của contact
      replyContact: mine ? info?.id : (contact as any)?.id,
      replyContactName: mine ? info?.name : (contact as any)?.name,
      replyContent: (message as string) || "",
    });
  };

  const toggleMenu = useCallback(
    (e: React.MouseEvent) => {
      const menu = refMenu.current;
      if (!menu) return;

      const containerRect = getContainerRect?.() ?? new DOMRect();
      // Nếu click ở nửa dưới container → mở menu lên trên (tránh bị khuất); ngược lại mở xuống dưới
      const direction =
        e.clientY > containerRect.top + containerRect.height / 2
          ? "above"
          : "below";

      setShow((prev) => !prev);
      menu.classList.remove("above", "below");
      menu.classList.add(direction);
      // Transform origin điều chỉnh theo hướng mở và căn lề (tin mình = phải, người khác = trái)
      menu.style.transformOrigin = `${mine ? "100%" : "0%"} ${direction === "above" ? "60%" : "40%"}`;
    },
    [getContainerRect, mine],
  );

  return (
    <>
      {/* Nút "..." nằm bên trái tin của mình, bên phải tin người khác */}
      <EllipsisOutlined
        className={`absolute ${mine ? "-left-8" : "-right-8"} top-1 text-base`}
        onClick={toggleMenu}
      />
      <div
        ref={refMenu}
        data-show={show}
        className={`message-menu-container ${mine ? "-left-55" : "-right-55"}`}
      >
        <MessageMenuItem onClick={copyMessage} closeOnClick={false}>
          <CopyOutlined /> Copy message
        </MessageMenuItem>
        <MessageMenuItem
          // Vô hiệu hoá trong khi đang xử lý pin/unpin để tránh double-click
          className={pinning ? "pointer-events-none" : ""}
          onClick={() => pin(id ?? "", pinned ?? false)}
          closeOnClick={false}
        >
          {pinning ? (
            <SyncOutlined spin />
          ) : (
            <PushpinOutlined
              // Icon màu cam khi đang pinned để user nhận ra trạng thái hiện tại
              className={pinned ? "text-orange-500" : ""}
              rotate={316}
            />
          )}
          {/* Label thay đổi theo trạng thái pin hiện tại */}
          {pinned ? " Unpin" : " Pin"} message
        </MessageMenuItem>
        <MessageMenuItem
          onClick={replyMessage}
          closeOnClick={true}
          close={() => setShow(false)}
        >
          <i className="fa fa-reply" /> Reply message
        </MessageMenuItem>
        <MessageMenuItem
          onClick={() => setOpenForward(true)}
          closeOnClick={true}
          close={() => setShow(false)}
        >
          <i className="fa fa-share" /> Forward message
          <BackgroundPortal
            show={openForward}
            className="laptop:w-100 phone:w-80 desktop:w-[35%]"
            title="Forward message"
            onClose={() => setOpenForward(false)}
          >
            <div className="phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col p-5">
              <Suspense fallback={<ModalLoading />}>
                <ForwardMessageModal message={message as any} />
              </Suspense>
            </div>
          </BackgroundPortal>
        </MessageMenuItem>
      </div>
    </>
  );
};

export default MessageMenu;
