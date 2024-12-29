import React from "react";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import ProfileSettingMenu from "./ProfileSettingMenu";

const ProfileSetting = (props) => {
  const { profile, onchange } = props;
  return (
    <div className="flex w-[50%] flex-col items-center justify-between">
      <div className="relative flex w-full justify-center">
        <ImageWithLightBoxWithBorderAndShadow
          src={profile?.Avatar ?? ""}
          className="aspect-square cursor-pointer rounded-[50%] border-l-[.4rem] border-r-[.4rem] border-t-[.4rem] laptop:w-[60%]"
          slides={[
            {
              src: profile?.Avatar ?? "",
            },
          ]}
        />
        {/* <MediaPicker
          className="absolute left-[20%] top-[-5%] text-xl"
          accept="image/png, image/jpeg"
          id="customer-avatar"
          onChange={onchange}
        /> */}
      </div>
      <ProfileSettingMenu />
    </div>
  );
};

export default ProfileSetting;
