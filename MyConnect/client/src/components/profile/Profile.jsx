import React, { useRef } from "react";
import EditProfile from "./EditProfile";
import ProfileSetting from "./ProfileSetting";

const Profile = ({ onclose }) => {
  const refProfileWrapper = useRef();
  const refEditProfile = useRef();

  const showEdit = () => {
    refProfileWrapper.current.setAttribute("data-state", "edit");
    refEditProfile.reset();
  };

  const showSetting = () => {
    refProfileWrapper.current.setAttribute("data-state", "setting");
  };

  return (
    <div className="fixed left-[50%] top-[50%] z-[1001] w-[40rem] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl">
      <div
        ref={refProfileWrapper}
        data-state="setting"
        className="flex transition-all duration-500 data-[state=edit]:translate-x-[-100%] data-[state=setting]:translate-x-0"
      >
        <ProfileSetting onclose={onclose} onClick={showEdit} />
        <EditProfile
          refEditProfile={refEditProfile}
          onclose={onclose}
          showSetting={showSetting}
        />
      </div>
    </div>
  );
};

export default Profile;
