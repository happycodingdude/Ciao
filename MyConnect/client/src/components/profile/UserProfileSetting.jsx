import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
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

  const chat = () => {
    const chat = checkExistChat(profile.Id);
    if (chat !== undefined) {
      document.querySelector(`[data-key='${chat.Id}']`).click();
      onClose();
      return;
    }

    HttpRequest({
      method: "get",
      url: `api/conversations`,
      token: auth.token,
    }).then((res) => {
      let participantArr = [];
      res
        .filter((item) => !item.IsGroup)
        .map(
          (item) =>
            (participantArr = [...participantArr, ...item.Participants]),
        );
      const selectedConversation = res
        .filter((item) => !item.IsGroup)
        .filter((item) =>
          item.Participants.some((item) => item.ContactId === auth.user.Id),
        )
        .find((item) =>
          item.Participants.some((item) => item.ContactId === profile.Id),
        );
      console.log(selectedConversation);
      if (selectedConversation) {
        let selectedParticipant = selectedConversation.Participants.find(
          (item) => item.ContactId === auth.user.Id,
        );
        selectedParticipant.IsDeleted = false;
        HttpRequest({
          method: "put",
          url: `api/conversations/${selectedConversation.Id}/participants`,
          token: auth.token,
          data: selectedParticipant,
        }).then((res) => {
          onClose();
        });
      } else {
        const body = {
          Participants: [
            {
              ContactId: auth.user.Id,
              IsNotifying: true,
              IsModerator: true,
            },
            {
              ContactId: profile.Id,
              IsNotifying: true,
            },
          ],
        };
        HttpRequest({
          method: "post",
          url: `api/conversations`,
          token: auth.token,
          data: body,
        }).then((res) => {
          onClose();
        });
      }
    });
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
    <div className="flex w-full grow flex-col bg-[var(--bg-color)] p-[2rem] pb-[3rem]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
        <ImageWithLightBoxWithBorderAndShadow
          src={profile?.Avatar ?? ""}
          className="aspect-square w-[25%] cursor-pointer rounded-[50%] border-l-[.4rem] border-r-[.4rem] border-t-[.4rem]"
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
                // <div
                //   onClick={addFriend}
                //   className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                // >
                //   Add friend
                // </div>
                <CustomButton
                  title="Add friend"
                  className="!w-1/2"
                  onClick={addFriend}
                />
              ),
              request_received: (
                // <div
                //   onClick={acceptFriendRequest}
                //   className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                // >
                //   Accept friend request
                // </div>
                <CustomButton
                  title="Accept friend request"
                  className="!w-1/2"
                  onClick={acceptFriendRequest}
                />
              ),
              request_sent: (
                // <div
                //   onClick={cancelFriendRequest}
                //   className="w-1/2 cursor-pointer rounded-xl bg-[#f0f0f0] px-[1rem] py-[.5rem] text-center hover:bg-[#dadada]"
                // >
                //   Cancel friend request
                // </div>
                <CustomButton
                  title="Cancel friend request"
                  className="!w-1/2"
                  onClick={cancelFriendRequest}
                />
              ),
            }[status]
          }

          {/* <div
            onClick={chat}
            className={`w-1/2 cursor-pointer rounded-xl bg-pink-100 px-[1rem] py-[.5rem] text-center text-pink-500 hover:bg-pink-200`}
          >
            Chat
          </div> */}
          <CustomButton title="Chat" className="!w-1/2" onClick={chat} />
        </div>
      </div>
      {/* <UserProfileSettingMenu /> */}
    </div>
  );
};

export default UserProfileSetting;
