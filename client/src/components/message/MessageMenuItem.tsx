// import EmojiPicker from "emoji-picker-react";
import "../../styles/messagemenu.css";

type MessageMenuItemProps = {
  className?: string;
  closeOnClick?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  close?: () => void;
  tooltip?: string;
};

const MessageMenuItem = ({
  className,
  closeOnClick,
  onClick,
  children,
  close,
  tooltip,
}: MessageMenuItemProps) => {
  return (
    <div
      className={`message-menu-item ${className ?? ""}`}
      title={tooltip}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        if (closeOnClick) close();
      }}
    >
      {children}
    </div>
  );
};

export default MessageMenuItem;
