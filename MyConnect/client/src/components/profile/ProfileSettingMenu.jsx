import React from "react";
import Signout from "../authentication/Signout";

const ProfileSettingMenu = () => {
  return (
    <div
      className="flex w-full flex-col gap-[2rem] [&>*]:rounded-3xl [&>*]:border-t-[.1rem] [&>*]:border-[var(--main-color-thin)] 
      [&>*]:px-4 [&>*]:py-2 [&>*]:shadow-[0px_2px_3px_0px_var(--main-color-normal)]"
    >
      <Signout />
    </div>
  );
};

export default ProfileSettingMenu;
