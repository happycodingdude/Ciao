import React, { useRef } from "react";
import UserProfileSetting from "./UserProfileSetting";

const UserProfile = ({ id, onclose }) => {
  const refProfileWrapper = useRef();

  return (
    <div
      ref={refProfileWrapper}
      data-state="setting"
      className="flex transition-all duration-500 data-[state=edit]:translate-x-[-100%] data-[state=setting]:translate-x-0"
    >
      <UserProfileSetting id={id} onclose={onclose} />
    </div>
  );
};

export default UserProfile;
