import { CloseOutlined } from "@ant-design/icons";
import React from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "../common/ImageWithLightBox";
import Signout from "../sidebar/Signout";

const ProfileSetting = ({ reference }) => {
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
          onClick={() => reference.hideProfile()}
        />
      </div>
      <div className="flex items-center gap-[1rem]">
        <ImageWithLightBox
          src={auth.user?.Avatar ?? ""}
          className="aspect-square w-[5rem] rounded-[50%]"
          onClick={() => {}}
        />
        <div className="flex flex-col">
          <p className="text-md">{auth.user?.Name}</p>
          <p className="text-sm text-gray-400">{auth.user?.Username}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[2rem]">
        <div className="flex justify-between">
          <div
            className="flex cursor-pointer items-center"
            onClick={() => reference.showEdit()}
          >
            <div className="fa fa-user w-[2rem] font-normal text-gray-400"></div>
            <p className="">Edit profile</p>
          </div>
          <div className="fa fa-arrow-right font-light text-gray-400"></div>
        </div>
        {/* <div className="flex justify-between">
          <div className="flex cursor-pointer items-center">
            <div className="fa fa-lock w-[2rem] font-normal text-gray-400"></div>
            <p className="">Change password</p>
          </div>
          <div className="fa fa-arrow-right font-light text-gray-400"></div>
        </div> */}
        <Signout className="text-red-500" />
      </div>
    </div>
  );
};

export default ProfileSetting;
