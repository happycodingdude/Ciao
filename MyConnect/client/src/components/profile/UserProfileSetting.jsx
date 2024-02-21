import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";

const UserProfileSetting = ({ id, onClose, checkExistChat }) => {
  const auth = useAuth();
  const [profile, setProfile] = useState();
  const [status, setStatus] = useState();
  const friendRequest = useRef();

  useEffect(() => {
    const controller = new AbortController();
    HttpRequest({
      method: "get",
      url: `api/contacts/${id}`,
      token: auth.token,
      controller: controller,
    }).then((res) => {
      if (!res) return;
      setProfile(res);
    });
    HttpRequest({
      method: "get",
      url: `api/contacts/${auth.user.Id}/friends/${id}`,
      token: auth.token,
      controller: controller,
    }).then((res) => {
      if (!res) return;
      friendRequest.current = res;
      setStatus(res.Status);
    });

    return () => {
      controller.abort();
    };
  }, [id]);

  const addFriend = () => {
    HttpRequest({
      method: "post",
      url: `api/friends`,
      token: auth.token,
      data: {
        ContactId1: auth.user.Id,
        ContactId2: profile.Id,
        Status: "request",
      },
    }).then((res) => {
      onClose();
    });
  };

  const checkConversation = () => {
    return HttpRequest({
      method: "get",
      url: `api/conversations`,
      token: auth.token,
    }).then((res) => {
      if (!res) return [];
      return res;
    });
  };

  const chat = () => {
    const chat = checkExistChat(profile.Id);
    if (chat !== undefined) {
      document.querySelector(`[data-key='${chat.Id}']`).click();
      onClose();
      return;
    }

    checkConversation().then((res) => {
      console.log(res);
    });

    // HttpRequest({
    //   method: "post",
    //   url: `api/conversations`,
    //   token: auth.token,
    //   data: {
    //     Participants: [
    //       {
    //         ContactId: auth.id,
    //         IsNotifying: true,
    //         IsModerator: true,
    //       },
    //       {
    //         ContactId: profile.Id,
    //         IsNotifying: true,
    //       },
    //     ],
    //   },
    // }).then((res) => {
    //   onClose();
    // });
  };

  const acceptFriendRequest = () => {
    friendRequest.current.Status = "friend";
    friendRequest.current.AcceptTime = moment().format("YYYY/MM/DD HH:mm:ss");
    HttpRequest({
      method: "put",
      url: `api/friends`,
      token: auth.token,
      data: friendRequest.current,
    }).then((res) => {
      onClose();
    });
  };

  const cancelFriendRequest = () => {
    HttpRequest({
      method: "delete",
      url: `api/friends/${friendRequest.current.Id}`,
      token: auth.token,
    }).then((res) => {
      onClose();
    });
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
                  Accept friend request
                </div>
              ),
              request_sent: (
                <div
                  onClick={cancelFriendRequest}
                  className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                >
                  Cancel friend request
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
