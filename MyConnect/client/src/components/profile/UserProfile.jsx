import React from "react";
import UserProfileSetting from "./UserProfileSetting";

const UserProfile = ({ id, onClose, checkExistChat }) => {
  return (
    <UserProfileSetting
      id={id}
      onClose={onClose}
      checkExistChat={checkExistChat}
    />
  );
};

export default UserProfile;
