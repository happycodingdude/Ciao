// import EmojiPicker from "emoji-picker-react";
import {
  ArrowRightOutlined,
  CopyOutlined,
  EllipsisOutlined,
  PushpinOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useRef, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import "../../../messagemenu.css";
import useInfo from "../../authentication/hooks/useInfo";
import { MessageCache } from "../../listchat/types";
import pinMessage from "../services/pinMessage";
import { MessageMenuProps } from "../types";

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

  const [show, setShow] = useState(false);
  const [pinning, setPinning] = useState(false);

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
        console.log("Message copied to clipboard");
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
      const containerRect = getContainerRect();
      const clickY = e.clientY;
      const clickX = e.clientX;

      const direction =
        clickY > containerRect.top + containerRect.height / 2
          ? "above"
          : "below";

      const menu = refMenu.current;
      if (!menu) return;

      // Xác định transform origin
      const menuParentRect = (
        e.currentTarget as HTMLElement
      ).getBoundingClientRect();
      const offsetX = clickX - menuParentRect.left;
      const offsetY = clickY - menuParentRect.top;

      // Chuyển sang % trong menu
      const originX = `${(offsetX / menuParentRect.width) * 100}%`;
      const originY = direction === "above" ? "100%" : "0%";

      // Gán transform origin động
      menu.style.transformOrigin = `${originX} ${originY}`;

      // Gán class direction
      menu.classList.remove("above", "below");
      menu.classList.add(direction);

      setShow((prev) => !prev);
    },
    [getContainerRect],
  );

  return (
    <>
      <div
        ref={refMenu}
        data-show={show}
        // className={`message-menu-container ${dropUp ? "top-[-8rem]" : "top-[-5rem]"} ${mine ? "left-[-18rem] origin-right" : "right-[-18rem] origin-left"}`}
        // className={`message-menu-container ${mine ? "left-[-18rem] origin-right" : "right-[-18rem] origin-left"}`}
        className={`message-menu-container ${mine ? "left-[-18rem] origin-right" : "right-[-18rem] origin-left"}`}
      >
        <div className="message-menu-item" onClick={copyMessage}>
          <CopyOutlined /> Copy message
        </div>
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
        <div className="message-menu-item">
          <ArrowRightOutlined /> Forward message
        </div>
      </div>
      <EllipsisOutlined
        className={`absolute ${mine ? "left-[-2rem]" : "right-[-2rem]"} top-[.5rem] text-lg`}
        // onClick={() => {
        //   setShow(!show);
        // }}
        onClick={(e) => toggleMenu(e)}
      />
    </>
  );
};

export default MessageMenu;
