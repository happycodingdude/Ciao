import axios from "axios";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hook/CustomHooks";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";

const UserProfileSetting = ({ id, onClose, checkExistChat }) => {
  const auth = useAuth();
  const [profile, setProfile] = useState();
  const [status, setStatus] = useState();
  const friendRequest = useRef();

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
        friendRequest.current = res.data.data;
        setStatus(res.data.data.Status);
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

  const checkConversation = async (cancelToken) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    return axios.get("api/participants", {
      cancelToken: cancelToken.token,
      headers: headers,
    });
  };

  const chat = () => {
    const chat = checkExistChat(
      friendRequest.current.ContactId1 === auth.user.Id
        ? friendRequest.current.ContactId2
        : friendRequest.current.ContactId1,
    );
    if (chat !== undefined) {
      document.querySelector(`[data-key='${chat.Id}']`).click();
      onClose();
      return;
    }

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = {
      Participants: [
        {
          ContactId: auth.id,
          IsNotifying: true,
          IsModerator: true,
        },
        {
          ContactId: profile.Id,
          IsNotifying: true,
        },
      ],
    };

    axios
      .post(`api/conversations`, body, {
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

  const acceptFriendRequest = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    friendRequest.current.Status = "friend";
    friendRequest.current.AcceptTime = moment().format("YYYY/MM/DD HH:mm:ss");
    axios
      .put(`api/friends`, friendRequest.current, {
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

  const cancelFriendRequest = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .delete(`api/friends/${friendRequest.current.Id}`, {
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
        <div className={`inline-flex w-full justify-center gap-8`}>
          {
            {
              new: (
                <div
                  onClick={addFriend}
                  className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                >
                  Add friend
                </div>
              ),
              request_received: (
                <div
                  onClick={acceptFriendRequest}
                  className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                >
                  Accept
                </div>
              ),
              request_sent: (
                <div
                  onClick={cancelFriendRequest}
                  className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                >
                  Cancel
                </div>
              ),
            }[status]
          }

          <div
            onClick={chat}
            className={`w-1/2 cursor-pointer rounded-xl bg-pink-100 px-[1rem] py-[.5rem] text-center text-pink-500 hover:bg-pink-200`}
          >
            Chat
          </div>
        </div>
      </div>
      {/* <UserProfileSettingMenu /> */}
    </div>
  );
};

export default UserProfileSetting;
