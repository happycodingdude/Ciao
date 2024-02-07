import React, { useRef } from "react";
import EditProfile from "./EditProfile";
import ProfileSetting from "./ProfileSetting";

const Profile = ({ reference }) => {
  const refProfileWrapper = useRef();
  const refEditProfile = useRef();

  const showEdit = () => {
    refProfileWrapper.current.setAttribute("data-state", "hide");
    refEditProfile.reset();
  };

  const showSetting = () => {
    refProfileWrapper.current.setAttribute("data-state", "show");
  };

  const hideProfile = () => {
    reference.refProfileContainer.current.setAttribute("data-state", "hide");
  };

  return (
    <div className="fixed left-[50%] top-[50%] w-[40rem] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl">
      <div
        ref={refProfileWrapper}
        data-state="show"
        className="flex transition-all duration-500 data-[state=hide]:translate-x-[-100%] data-[state=show]:translate-x-0"
      >
        {/* Profile setting */}
        <ProfileSetting
          reference={{
            refProfileWrapper,
            refEditProfile,
            hideProfile,
            showEdit,
          }}
        />

        {/* Edit profile */}
        <EditProfile
          reference={{
            refProfileWrapper,
            refEditProfile,
            hideProfile,
            showSetting,
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
