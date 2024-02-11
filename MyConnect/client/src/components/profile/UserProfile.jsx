import React, { useRef } from "react";
import UserProfileSetting from "./UserProfileSetting";

const UserProfile = ({ id, onclose }) => {
  const refProfileWrapper = useRef();

  return (
    <div className="fixed left-[50%] top-[50%] z-[1001] w-[40rem] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl">
      <div
        ref={refProfileWrapper}
        data-state="setting"
        className="flex transition-all duration-500 data-[state=edit]:translate-x-[-100%] data-[state=setting]:translate-x-0"
      >
        <UserProfileSetting id={id} onclose={onclose} />
      </div>
    </div>
  );
};

export default UserProfile;
