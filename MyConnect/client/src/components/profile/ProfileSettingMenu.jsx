import React from "react";
import Signout from "../sidebar/Signout";

const ProfileSettingMenu = ({ onClick }) => {
  return (
    <div className="flex flex-col gap-[2rem]">
      <div className="flex justify-between">
        <div className="flex cursor-pointer items-center" onClick={onClick}>
          <div className="fa fa-user w-[2rem] font-normal text-gray-400"></div>
          <p>Edit profile</p>
        </div>
        <div className="fa fa-arrow-right font-light text-gray-400"></div>
      </div>
      <Signout className="text-red-500" />
    </div>
  );
};

export default ProfileSettingMenu;
