import React, { useEffect } from "react";
import CustomButton from "../../../components/CustomButton";
import ImageWithLightBoxWithBorderAndShadow from "../../../components/ImageWithLightBoxWithBorderAndShadow";
import HttpRequest from "../../../lib/fetch";
import {
  useAuth,
  useFetchConversations,
  useFetchFriends,
} from "../../hook/CustomHooks";
import FriendRequestButton from "../friend/FriendRequestButton";

const UserProfileSetting = (props) => {
  const { id, onClose } = props;
  const auth = useAuth();
  const {
    checkExist,
    reFetch: reFetchConversations,
    setSelected,
  } = useFetchConversations();
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
      setConversationAndClose(chat);
      return;
    }

    HttpRequest({
      method: "get",
      url: `api/conversations`,
      token: auth.token,
    }).then((res) => {
      let participantArr = [];
      res.data
        .filter((item) => !item.IsGroup)
        .map(
          (item) =>
            (participantArr = [...participantArr, ...item.Participants]),
        );
      const selectedConversation = res.data
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
        const selectedParticipant = selectedConversation.Participants.find(
          (item) => item.ContactId === auth.user.Id,
        );
        const body = [
          {
            op: "replace",
            path: "IsDeleted",
            value: false,
          },
        ];
        return HttpRequest({
          method: "patch",
          url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GETBYID.replace(
            "{id}",
            selectedParticipant.Id,
          ),
          token: auth.token,
          data: body,
        }).then((res) => {
          reFetchConversations();
          setConversationAndClose(selectedConversation);
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
          url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GET,
          token: auth.token,
          data: body,
        }).then((res) => {
          reFetchConversations();
          setConversationAndClose(res.data);
        });
      }
    });
  };

  const setConversationAndClose = (conversation) => {
    setSelected(conversation);
    onClose();
  };

  return (
    <div className="flex w-full flex-col bg-[var(--bg-color)] p-[2rem]">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-12">
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
          <p className="text-lg font-bold">{profile?.Name}</p>
          <p className="text-[var(--text-main-color-normal)]">{profile?.Bio}</p>
        </div>
        <div className="flex w-full">
          <FriendRequestButton
            className="fa fa-user-plus !w-1/3"
            onClose={() => {
              onClose();
            }}
          />
          <CustomButton
            title="Chat"
            className={`${request?.Status === "friend" ? "!w-1/2" : "!w-1/3"} `}
            onClick={chat}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfileSetting;
