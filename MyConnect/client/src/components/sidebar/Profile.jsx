// import axios from "axios";
import { CloseOutlined } from "@ant-design/icons";
import React from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "../common/ImageWithLightBox";

const Profile = () => {
  const auth = useAuth();

  const showProfile = () => {
    console.log("showProfile calling");
  };

  return (
    // <div className="flex items-center hover:bg-[#f0f0f0]">
    //   <div className="fa fa-user w-[2rem] cursor-pointer font-light text-gray-400"></div>
    //   <p className="">Profile</p>
    // </div>

    <div className="fixed left-[50%] top-[50%] z-[1000]  w-[40rem] translate-x-[-50%] translate-y-[-50%] scale-100 overflow-hidden">
      <div className="flex translate-x-[-100%] transition-all duration-1000">
        {/* Profile setting */}
        <div
          className="flex w-full shrink-0 flex-col rounded-2xl bg-white p-[2rem] pb-[3rem] 
     [&>*:not(:first-child)]:my-[1rem] [&>*:not(:first-child)]:rounded-3xl [&>*:not(:first-child)]:bg-white [&>*:not(:first-child)]:p-[2rem]
    [&>*:not(:first-child)]:shadow-[0px_0px_20px_-3px_#dbdbdb]"
        >
          <div className="mb-[5rem] flex justify-between">
            <p className="text-2xl font-medium text-gray-600">Profile</p>
            <CloseOutlined className="flex cursor-pointer items-start text-lg" />
          </div>
          <div className="flex items-center gap-[1rem]">
            <ImageWithLightBox
              src={auth.user?.Avatar ?? ""}
              className="aspect-square w-[5rem] cursor-pointer rounded-[50%]"
              onClick={showProfile}
            />
            <div className="flex flex-col">
              <p className="text-md">{auth.display}</p>
              <p className="text-sm text-gray-400">{auth.user?.Username}</p>
            </div>
          </div>
          <div className="flex flex-col gap-[2rem]">
            <div className="flex justify-between">
              <div className="flex cursor-pointer items-center gap-[1rem]">
                <div className="fa fa-user font-normal text-gray-400"></div>
                <p className="">Edit profile</p>
              </div>
              <div className="fa fa-arrow-right font-light text-gray-400"></div>
            </div>
            <div className="flex justify-between">
              <div className="flex cursor-pointer items-center gap-[1rem]">
                <div className="fa fa-lock font-normal text-gray-400"></div>
                <p className="">Change password</p>
              </div>
              <div className="fa fa-arrow-right font-light text-gray-400"></div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div
          className="flex w-full shrink-0 flex-col rounded-2xl bg-white p-[2rem] pb-[3rem] transition-all
    duration-1000 [&>*:not(:first-child)]:my-[1rem] [&>*:not(:first-child)]:rounded-3xl [&>*:not(:first-child)]:bg-white [&>*:not(:first-child)]:p-[2rem]
    [&>*:not(:first-child)]:shadow-[0px_0px_20px_-3px_#dbdbdb]"
        >
          <div className="mb-[5rem] flex justify-between">
            <p className="text-2xl font-medium text-gray-600">Profile</p>
            <CloseOutlined className="flex cursor-pointer items-start text-lg" />
          </div>
          <div className="flex items-center gap-[1rem]">
            <ImageWithLightBox
              src={auth.user?.Avatar ?? ""}
              className="aspect-square w-[5rem] cursor-pointer rounded-[50%]"
              onClick={showProfile}
            />
            <div className="flex flex-col">
              <p className="text-md">{auth.display}</p>
              <p className="text-sm text-gray-400">{auth.user?.Username}</p>
            </div>
          </div>
          <div className="flex flex-col gap-[2rem]">
            <div className="flex justify-between">
              <div className="flex cursor-pointer items-center gap-[1rem]">
                <div className="fa fa-user font-normal text-gray-400"></div>
                <p className="">Edit profile</p>
              </div>
              <div className="fa fa-arrow-right font-light text-gray-400"></div>
            </div>
            <div className="flex justify-between">
              <div className="flex cursor-pointer items-center gap-[1rem]">
                <div className="fa fa-lock font-normal text-gray-400"></div>
                <p className="">Change password</p>
              </div>
              <div className="fa fa-arrow-right font-light text-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
