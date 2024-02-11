import { CloseOutlined } from "@ant-design/icons";
import React from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ProfileSettingMenu from "./ProfileSettingMenu";

const ProfileSetting = ({ onclose, onClick }) => {
  const auth = useAuth();

  return (
    <div
      className="flex w-full shrink-0 flex-col  bg-white p-[2rem] pb-[3rem] 
     [&>*:not(:first-child)]:my-[1rem] [&>*:not(:first-child)]:rounded-3xl [&>*:not(:first-child)]:bg-white [&>*:not(:first-child)]:p-[2rem]
    [&>*:not(:first-child)]:shadow-[0px_0px_20px_-3px_#dbdbdb]"
    >
      <div className="mb-[5rem] flex justify-between">
        <p className="text-xl font-medium leading-10 text-gray-600">Profile</p>
        <CloseOutlined
          className="flex cursor-pointer items-start text-lg"
          onClick={onclose}
        />
      </div>
      <div className="flex items-center gap-[1rem]">
        <ImageWithLightBox
          src={auth.user?.Avatar ?? ""}
          className="aspect-square w-[5rem] cursor-pointer rounded-[50%]"
          slides={[
            {
              src: auth.user?.Avatar ?? "",
            },
          ]}
        />
        <div className="flex flex-col">
          <p className="text-md">{auth.user?.Name}</p>
          <p className="text-sm text-gray-400">{auth.user?.Username}</p>
        </div>
      </div>
      <ProfileSettingMenu onClick={onClick} />
    </div>
  );
};

export default ProfileSetting;
