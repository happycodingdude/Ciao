import React from "react";
import Signout from "../authentication/Signout";

const ProfileSettingMenu = () => {
  return (
    <div
      className="flex w-full flex-col gap-[2rem]
    [&>*]:rounded-3xl [&>*]:border-t-[.1rem] [&>*]:border-pink-200
    [&>*]:px-4 [&>*]:py-2 [&>*]:shadow-[0px_2px_3px_#f9a8d4]"
    >
      <Signout className="text-red-500" />
    </div>
  );
};

export default ProfileSettingMenu;
