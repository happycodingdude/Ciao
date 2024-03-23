import React, { useEffect } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
} from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import AcceptButton from "../friend/AcceptButton";
import AddButton from "../friend/AddButton";
import CancelButton from "../friend/CancelButton";

const UserProfileSetting = (props) => {
  const { id, onClose } = props;
  const auth = useAuth();
  const { checkExist } = useFetchConversations();
  const { request, profile, reFetchProfile, reFetchRequest } =
    useFetchFriends();

  useEffect(() => {
    const controller = new AbortController();
    reFetchProfile(id, controller);
    reFetchRequest(id, controller);

    return () => {
      controller.abort();
    };
  }, [id]);

  const chat = () => {
    const chat = checkExist(profile.Id);
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
      // Tìm hội thoại đã có trước đó nhưng đã delete
      // Bật lại hội thoại
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
          document.querySelector(`[data-key='${res.Id}']`).click();
        });
        // Ko tồn tại hội thoại giữa 2 contact thì tạo mới
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
              IsDeleted: true,
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
          document.querySelector(`[data-key='${res.Id}']`).click();
        });
      }
    });
  };

  return (
    <div className="flex w-full flex-col bg-[var(--bg-color)] p-[2rem] pb-[3rem]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
        <ImageWithLightBoxWithBorderAndShadow
          src={profile?.Avatar ?? ""}
          className="aspect-square w-[20%] cursor-pointer rounded-[50%] border-l-[.4rem] border-r-[.4rem] border-t-[.4rem]"
          slides={[
            {
              src: profile?.Avatar ?? "",
            },
          ]}
        />
        <div className="flex flex-col">
          <p>{profile?.Name}</p>
        </div>
        <div className="inline-flex w-full">
          {
            {
              new: (
                <AddButton
                  id={profile?.Id}
                  className="w-1/3"
                  onClose={onClose}
                />
              ),
              request_received: (
                <AcceptButton
                  className="w-1/3"
                  request={request}
                  onClose={onClose}
                />
              ),
              request_sent: (
                <CancelButton
                  id={request?.Id}
                  className="w-1/3"
                  onClose={onClose}
                />
              ),
            }[request?.Status]
          }
          <CustomButton title="Chat" className="w-1/3" onClick={chat} />
        </div>
      </div>
    </div>
  );
};

export default UserProfileSetting;
