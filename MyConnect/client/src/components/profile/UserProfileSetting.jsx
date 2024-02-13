import axios from "axios";
import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";

const ProfileSetting = ({ id, onClose }) => {
  const [profile, setProfile] = useState();
  const [status, setStatus] = useState();
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

    axios
      .get(`api/contacts/${auth.user.Id}/friends/${id}`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        if (res.data.data === null) setStatus("new");
        else setStatus(res.data.data.Status);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [id]);

  const addFriend = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = {
      ContactId1: auth.user.Id,
      ContactId2: profile.Id,
      Status: "request",
    };
    axios
      .post(`api/friends`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        onClose();
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const chat = () => {
    onClose();
  };

  return (
    <div
      className="flex w-full grow flex-col bg-white p-[2rem] pb-[3rem] 
     [&>*:not(:first-child)]:my-[1rem] [&>*:not(:first-child)]:rounded-3xl 
     [&>*:not(:first-child)]:bg-white [&>*:not(:first-child)]:p-[2rem]
     [&>*:not(:first-child)]:shadow-[0px_0px_20px_-3px_#dbdbdb]"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
        <ImageWithLightBoxWithBorderAndShadow
          src={profile?.Avatar ?? ""}
          className="aspect-square w-[25%] cursor-pointer rounded-[50%] 
          border-l-[.4rem] border-r-[.4rem] border-t-[.4rem]"
          slides={[
            {
              src: profile?.Avatar ?? "",
            },
          ]}
        />
        <div className="flex flex-col">
          <p>{profile?.Name}</p>
        </div>
        <div className="inline-flex w-full gap-8">
          {status === "new" ? (
            <div
              onClick={addFriend}
              className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
            >
              Add friend
            </div>
          ) : (
            <div
              // onClick={addFriend}
              className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
            >
              Request sent
            </div>
          )}

          <div
            onClick={chat}
            className="w-1/2 cursor-pointer rounded-xl bg-pink-100 px-[1rem] py-[.5rem] text-center text-pink-500 hover:bg-pink-200"
          >
            Chat
          </div>
        </div>
      </div>
      {/* <UserProfileSettingMenu /> */}
    </div>
  );
};

export default ProfileSetting;
