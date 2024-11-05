import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useConversation, useInfo } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendCtaButton = (props) => {
  const { friend, setContacts, onClose } = props;

  if (!friend) return;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  // const chat = (contact) => {
  //   const existedConversation = conversations.conversations.find(
  //     (item) =>
  //       item.isGroup === false &&
  //       item.participants.some((item) => item.contact.id === contact.id),
  //   );
  //   if (existedConversation) {
  //     queryClient.setQueryData(["conversation"], (oldData) => {
  //       return { ...oldData, selected: existedConversation.id };
  //     });
  //   } else {
  //     HttpRequest({
  //       method: "post",
  //       url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
  //         "{contact-id}",
  //         contact.id,
  //       ),
  //     }).then((res) => {
  //       queryClient.setQueryData(["conversation"], (oldData) => {
  //         return {
  //           ...oldData,
  //           conversations: [
  //             {
  //               isGroup: false,
  //               isNotifying: true,
  //               id: res.data,
  //               participants: [
  //                 {
  //                   contact: {
  //                     id: info.data.id,
  //                     name: info.data.name,
  //                     avatar: info.data.avatar,
  //                     isOnline: true,
  //                   },
  //                 },
  //                 {
  //                   contact: {
  //                     id: contact.id,
  //                     name: contact.name,
  //                     avatar: contact.avatar,
  //                     isOnline: contact.isOnline,
  //                   },
  //                 },
  //               ],
  //             },
  //             ...oldData.conversations,
  //           ],
  //           selected: res.data,
  //         };
  //       });
  //     });
  //   }
  //   onClose();
  // };

  const chat = (contact) => {
    const existedConversation = conversations.conversations.find(
      (item) =>
        item.isGroup === false &&
        item.participants.some((item) => item.contact.id === contact.id),
    );
    if (existedConversation) {
      queryClient.setQueryData(["conversation"], (oldData) => {
        return {
          ...oldData,
          selected: existedConversation,
          fromListFriend: true,
        };
      });
    } else {
      let randomId = Math.random().toString(36).substring(2, 7);
      HttpRequest({
        method: "post",
        url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
          "{contact-id}",
          contact.id,
        ),
      }).then((res) => {
        queryClient.setQueryData(["conversation"], (oldData) => {
          const cloned = Object.assign({}, oldData);
          const updatedConversations = cloned.conversations.map(
            (conversation) => {
              if (conversation.id !== randomId) return conversation;
              conversation.id = res.data;
              return conversation;
            },
          );
          return {
            ...oldData,
            conversations: updatedConversations,
            selected: {
              ...oldData.selected,
              id: res.data,
            },
            quickChatAdd: false,
            fromListFriend: true,
          };
        });
      });
      queryClient.setQueryData(["conversation"], (oldData) => {
        return {
          ...oldData,
          conversations: [
            {
              isGroup: false,
              isNotifying: true,
              id: randomId,
              participants: [
                {
                  isModerator: true,
                  contact: {
                    id: info.data.id,
                    name: info.data.name,
                    avatar: info.data.avatar,
                    isOnline: true,
                  },
                },
                {
                  contact: {
                    id: contact.id,
                    name: contact.name,
                    avatar: contact.avatar,
                    isOnline: contact.isOnline,
                  },
                },
              ],
            },
            ...oldData.conversations,
          ],
          selected: {
            id: randomId,
            title: contact.name,
            isGroup: false,
            participants: [
              {
                isModerator: true,
                contact: {
                  id: info.data.id,
                  name: info.data.name,
                  avatar: info.data.avatar,
                  isOnline: true,
                },
              },
              {
                contact: {
                  id: contact.id,
                  name: contact.name,
                  avatar: contact.avatar,
                  isOnline: contact.isOnline,
                },
              },
            ],
          },
          quickChatAdd: true,
        };
      });
    }
    onClose();
  };

  return {
    new: (
      <AddButton
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
        className={`!mr-0 !p-[.2rem] laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
        leadingClass="leading-[2.5rem]"
        gradientClass="after:h-[115%] after:w-[107%]"
        onClick={() => {
          chat(friend);
        }}
      />
    ),
  }[friend.friendStatus];
};

export default FriendCtaButton;
