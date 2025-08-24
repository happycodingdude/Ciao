// import EmojiPicker from "emoji-picker-react";
import {
  CopyOutlined,
  EllipsisOutlined,
  PushpinOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { Suspense, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import BackgroundPortal from "../../../components/BackgroundPortal";
import ModalLoading from "../../../components/ModalLoading";
import useEventListener from "../../../hooks/useEventListener";
import "../../../messagemenu.css";
import useInfo from "../../authentication/hooks/useInfo";
import { MessageCache } from "../../listchat/types";
import pinMessage from "../services/pinMessage";
import { MessageMenuProps } from "../types";
import ForwardMessageModal from "./ForwardMessageModal";

const MessageMenu = (props: MessageMenuProps) => {
  // console.log("ChatboxMenu calling");
  const {
    conversationId,
    id,
    message,
    mine,
    pinned,
    getContainerRect,
    getContentRect,
  } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();

  const [show, setShow] = useState<boolean>(false);
  const [pinning, setPinning] = useState<boolean>(false);
  const [openForward, setOpenForward] = useState<boolean>(false);

  const refMenu = useRef<HTMLDivElement>(null);

  // Event listener
  const hideMenuOnClick = useCallback((e) => {
    if (
      Array.from(e.target.classList).includes("message-menu-container") ||
      Array.from(e.target.classList).includes("message-menu-item")
    )
      return;
    setShow(false);
  }, []);
  useEventListener("click", hideMenuOnClick);

  const copyMessage = () => {
    if (!message) return;
    navigator.clipboard
      .writeText(message)
      .then(() => {
        toast.success("Message copied to clipboard");
        // console.log("Message copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy message: ", err);
      });
  };

  const pin = async () => {
    setPinning(true);
    await pinMessage({
      conversationId: conversationId,
      messageId: id,
      pinned: !pinned,
    });

    queryClient.setQueryData(["message"], (oldData: MessageCache) => {
      return {
        ...oldData,
        messages: oldData.messages.map((mess) => {
          if (mess.id !== id) return mess;
          return {
            ...mess,
            isPinned: !pinned,
            pinnedBy: info.id,
          };
        }),
      } as MessageCache;
    });
    setPinning(false);
  };

  const toggleMenu = useCallback(
    (e: React.MouseEvent) => {
      const menu = refMenu.current;
      if (!menu) return;

      const containerRect = getContainerRect();
      const clickY = e.clientY;

      const direction =
        clickY > containerRect.top + containerRect.height / 2
          ? "above"
          : "below";

      setShow((prev) => !prev);

      // Gán class direction
      menu.classList.remove("above", "below");
      menu.classList.add(direction);
      menu.style.transformOrigin = `${mine ? "100%" : "0%"} ${direction === "above" ? "75%" : "30%"} `;
    },
    [getContainerRect],
  );

  return (
    <>
      <div
        ref={refMenu}
        data-show={show}
        className={`message-menu-container ${mine ? "left-[-17rem]" : "right-[-17rem]"}
        data-[show=false]:z-0 data-[show=true]:z-[2]`}
      >
        {/* MARK: COPY */}
        <div className="message-menu-item" onClick={copyMessage}>
          <CopyOutlined /> Copy message
        </div>
        {/* MARK: PIN */}
        <div
          className={`message-menu-item ${pinning ? "pointer-events-none" : ""}`}
          onClick={pin}
        >
          {pinning ? (
            <SyncOutlined spin />
          ) : (
            <PushpinOutlined
              className={`${pinned ? "text-orange-500" : ""}`}
              rotate={316}
            />
          )}
          {pinned ? " Unpin" : " Pin"} message
        </div>
        {/* MARK: REPLY */}
        <div className="message-menu-item">
          <i className="fa fa-reply" /> Reply message
        </div>
        {/* MARK: FORWARD */}
        <div className="message-menu-item" onClick={() => setOpenForward(true)}>
          <i className="fa fa-share" /> Forward message
          <BackgroundPortal
            show={openForward}
            className="phone:w-[35rem] laptop:w-[50rem] desktop:w-[70rem]"
            title="Forward message"
            onClose={() => setOpenForward(false)}
          >
            <div className="flex flex-col gap-[1rem] p-10 pt-12 text-[var(--text-main-color)] phone:h-[50rem] laptop:h-[45rem] laptop-lg:h-[55rem] desktop:h-[80rem]">
              <Suspense fallback={<ModalLoading />}>
                <ForwardMessageModal
                  onClose={() => setOpenForward(false)}
                  message={message}
                />
              </Suspense>
            </div>
          </BackgroundPortal>
        </div>
      </div>
      <EllipsisOutlined
        className={`absolute ${mine ? "left-[-2rem]" : "right-[-2rem]"} top-[.5rem] text-lg`}
        onClick={(e) => toggleMenu(e)}
      />
    </>
  );
};

export default MessageMenu;
