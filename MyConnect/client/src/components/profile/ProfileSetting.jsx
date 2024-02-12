import React from "react";
import ImageWithLightBox from "../common/ImageWithLightBox";
import MediaPicker from "../common/MediaPicker";
import ProfileSettingMenu from "./ProfileSettingMenu";

const ProfileSetting = ({ profile, onchange }) => {
  return (
    <div className="flex h-[calc(100%-5rem)] w-[50%] flex-col items-center justify-evenly">
      <div className="relative flex justify-center">
        <ImageWithLightBox
          src={profile?.Avatar ?? ""}
          className="aspect-square w-[70%] cursor-pointer rounded-[50%]"
          slides={[
            {
              src: profile?.Avatar ?? "",
            },
          ]}
        />
        <MediaPicker
          className="absolute left-[25%] top-[-3%] text-xl"
          accept="image/png, image/jpeg"
          id="customer-avatar"
          onChange={onchange}
        />
      </div>
      {/* <div className="flex flex-col">
          <p className="text-md">{profile?.Name}</p>
          <p className="text-sm text-gray-400">{profile?.Username}</p>
        </div> */}
      <ProfileSettingMenu />
    </div>
  );
};

export default ProfileSetting;
