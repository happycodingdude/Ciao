import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useConversation } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import ImageWithLightBox from "../common/ImageWithLightBox";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendItem = (props) => {
  const { key, friend, setContacts, onClose } = props;

  const queryClient = useQueryClient();

  const { data: conversations } = useConversation();

  const chat = (contactId) => {
    const existedConversation = conversations.conversations.find(
      (item) =>
        item.isGroup === false &&
        item.participants.some((item) => item.contact.id === contactId),
    );
    if (existedConversation) {
      queryClient.setQueryData(["conversation"], (oldData) => {
        return { ...oldData, selected: existedConversation.id };
      });
    } else {
    }
    onClose();

    // HttpRequest({
    //   method: "get",
    //   url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GET,
    //   token: auth.token,
    // }).then((res) => {
    //   // let participantArr = [];
    //   // res.data
    //   //   .filter((item) => !item.IsGroup)
    //   //   .map(
    //   //     (item) =>
    //   //       (participantArr = [...participantArr, ...item.Participants]),
    //   //   );
    //   const selectedConversation = res.data
    //     .filter((item) => !item.isGroup)
    //     .filter((item) =>
    //       item.participants.some((item) => item.contactId === auth.id),
    //     )
    //     .find((item) =>
    //       item.participants.some((item) => item.contactId === contactId),
    //     );
    //   console.log(selectedConversation);
    //   // Tìm hội thoại đã có trước đó nhưng đã delete
    //   // Bật lại hội thoại
    //   if (selectedConversation) {
    //     const selectedParticipant = selectedConversation.participants.find(
    //       (item) => item.contactId === auth.id,
    //     );
    //     const body = [
    //       {
    //         op: "replace",
    //         path: "isDeleted",
    //         value: false,
    //       },
    //     ];
    //     return HttpRequest({
    //       method: "patch",
    //       url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GETBYID.replace(
    //         "{id}",
    //         selectedParticipant.id,
    //       ),
    //       token: auth.token,
    //       data: body,
    //     }).then((res) => {
    //       reFetchConversations();
    //       setConversationAndClose(selectedConversation);
    //     });
    //     // Ko tồn tại hội thoại giữa 2 contact thì tạo mới
    //   } else {
    //     const body = {
    //       participants: [
    //         {
    //           contactId: auth.id,
    //           isNotifying: true,
    //           isModerator: true,
    //         },
    //         {
    //           contactId: contactId,
    //           isNotifying: true,
    //           isDeleted: true,
    //         },
    //       ],
    //     };
    //     HttpRequest({
    //       method: "post",
    //       url: import.meta.env.VITE_ENDPOINT_CONVERSATION_INCLUDENOTIFY,
    //       token: auth.token,
    //       data: body,
    //     }).then((res) => {
    //       reFetchConversations();
    //       setConversationAndClose(res.data);
    //     });
    //   }
    // });
  };

  return (
    <div
      key={key}
      // data-key={friend.id}
      className="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-[var(--bg-color-light)]"
    >
      <ImageWithLightBox
        src={friend.avatar}
        className="aspect-square rounded-2xl laptop:w-[5rem]"
        spinnerClassName="laptop:bg-[size:2rem]"
        imageClassName="bg-[size:150%]"
        slides={[
          {
            src: friend.avatar,
          },
        ]}
      />
      <div className="flex h-full flex-col items-start">
        <p className="font-medium">{friend.name}</p>
        <p className="text-[var(--text-main-color-normal)]">{friend.Bio}</p>
      </div>
      {
        {
          new: (
            <AddButton
              // className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
              id={friend.id}
              onClose={(id) => {
                setContacts((current) => {
                  return current.map((contact) => {
                    if (contact.id !== friend.id) return contact;
                    contact.friendId = id;
                    contact.friendStatus = "request_sent";
                    return contact;
                  });
                });
              }}
            />
          ),
          request_received: (
            <AcceptButton
              // className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
              id={friend.friendId}
              onClose={() => {
                setContacts((current) => {
                  return current.map((contact) => {
                    if (contact.id !== friend.id) return contact;
                    contact.friendId = null;
                    contact.friendStatus = "friend";
                    return contact;
                  });
                });
              }}
            />
          ),
          request_sent: (
            <CancelButton
              // className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
              id={friend.friendId}
              onClose={() => {
                setContacts((current) => {
                  return current.map((contact) => {
                    if (contact.id !== friend.id) return contact;
                    contact.friendId = null;
                    contact.friendStatus = "new";
                    return contact;
                  });
                });
              }}
            />
          ),
          friend: (
            <CustomButton
              title="Chat"
              className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:!w-[6rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
              onClick={() => {
                chat(friend.id);
              }}
            />
          ),
        }[friend.friendStatus]
      }
    </div>
  );
};

export default FriendItem;
