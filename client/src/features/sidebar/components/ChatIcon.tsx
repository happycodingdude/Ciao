import React from "react";

const ChatIcon = ({ onClick }: { onClick?: () => void }) => {
  return <div className={`fa fa-comment base-icon`} onClick={onClick}></div>;
};

export default ChatIcon;
