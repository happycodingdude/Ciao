import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "../common/ImageWithLightBox";
import UserProfileSettingMenu from "./UserProfileSettingMenu";

const ProfileSetting = ({ id, onclose }) => {
  const [profile, setProfile] = useState();
  const auth = useAuth();

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };

    axios
      .get(`api/contacts/${id}`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setProfile(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [id]);

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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
        <ImageWithLightBox
          src={profile?.Avatar ?? ""}
          className="aspect-square w-[5rem] cursor-pointer rounded-[50%]"
          slides={[
            {
              src: profile?.Avatar ?? "",
            },
          ]}
        />
        <div className="flex flex-col">
          <p className="text-md">{profile?.Name}</p>
        </div>
        <div className="inline-flex w-full gap-8">
          <div className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]">
            Add friend
          </div>
          <div className="w-1/2 cursor-pointer rounded-xl bg-pink-100 px-[1rem] py-[.5rem] text-center text-pink-500 hover:bg-pink-200">
            Chat
          </div>
        </div>
      </div>
      <UserProfileSettingMenu />
    </div>
  );
};

export default ProfileSetting;
