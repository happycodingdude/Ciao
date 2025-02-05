import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import CustomButton from "../../../components/CustomButton";
import useLoading from "../../../hooks/useLoading";
import useInfo from "../../authentication/hooks/useInfo";
import reopenMember from "../../chatbox/services/reopenMember";
import useConversation from "../../listchat/hooks/useConversation";
import createDirectChat from "../services/createDirectChat";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendCtaButton = (props) => {
  const { friend, setContacts, onClose } = props;

  if (!friend) return;

  const queryClient = useQueryClient();

  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const chat = async (contact) => {
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = conversations.conversations.find(
      (conv) =>
        conv.isGroup === false &&
        conv.members.some((mem) => mem.contact.id === contact.id),
    );
    if (existedConversation) {
      queryClient.setQueryData(["conversation"], (oldData) => {
        // Move existed conversation to the top if the conversation was deleted
        // else keep the current position of the conversation
        let isDeletedConversation = existedConversation.members.find(
          (mem) => mem.contact.id === info.id,
        ).isDeleted;
        let updatedConversations = [];
        if (isDeletedConversation) {
          existedConversation.members = existedConversation.members.map(
            (mem) => {
              if (mem.contact.id !== info.id) return mem;
              mem.isDeleted = false;
              return mem;
            },
          );
          updatedConversations = [
            existedConversation,
            ...oldData.conversations.filter(
              (conv) => conv.id !== existedConversation.id,
            ),
          ];
        } else {
          updatedConversations = oldData.conversations.map((conv) => {
            if (conv.id !== existedConversation.id) return conv;
            conv.members = conv.members.map((mem) => {
              if (mem.contact.id !== info.id) return mem;
              mem.isDeleted = false;
              return mem;
            });
            return conv;
          });
        }
        return {
          ...oldData,
          conversations: updatedConversations,
          filterConversations: updatedConversations,
          selected: existedConversation,
          reload: true,
        };
      });
      reopenMember(existedConversation.id);
    } else {
      setLoading(true);
      createDirectChat(contact.id).then((res) => {
        queryClient.setQueryData(["conversation"], (oldData) => {
          const updatedConversations = oldData.conversations.map(
            (conversation) => {
              if (conversation.id !== randomId) return conversation;
              conversation.id = res.conversationId;
              return conversation;
            },
          );
          return {
            ...oldData,
            conversations: updatedConversations,
            filterConversations: updatedConversations,
            selected: {
              ...oldData.selected,
              id: res.conversationId,
            },
          };
        });
        setLoading(false);
      });

      queryClient.setQueryData(["conversation"], (oldData) => {
        const newConversation = {
          id: randomId,
          isGroup: false,
          isNotifying: true,
          members: [
            {
              isModerator: true,
              contact: {
                id: info.id,
                name: info.name,
                avatar: info.avatar,
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
          noLazy: true,
        };
        return {
          ...oldData,
          conversations: [newConversation, ...oldData.conversations],
          filterConversations: [newConversation, ...oldData.conversations],
          selected: newConversation,
          noLoading: true,
          reload: false,
        };
      });

      queryClient.setQueryData(["message"], (oldData) => {
        return {
          ...oldData,
          messages: [],
          hasMore: false,
        };
      });
      queryClient.setQueryData(["attachment"], (oldData) => {
        return [];
      });
    }
    onClose();
  };

  // const chat = (contact) => {
  //   const existedConversation = conversations.conversations.find(
  //     (item) =>
  //       item.isGroup === false &&
  //       item.members.some((item) => item.contact.id === contact.id),
  //   );
  //   if (existedConversation) {
  //     queryClient.setQueryData(["conversation"], (oldData) => {
  //       return {
  //         ...oldData,
  //         selected: existedConversation,
  //         fromListFriend: true,
  //       };
  //     });
  //   } else {
  //     let randomId = Math.random().toString(36).substring(2, 7);

  //     createDirectChat(contact.id).then((res) => {
  //       // queryClient.setQueryData(["conversation"], (oldData) => {
  //       //   const updatedConversations = oldData.conversations.map(
  //       //     (conversation) => {
  //       //       if (conversation.id !== randomId) return conversation;
  //       //       conversation.id = res.data;
  //       //       return conversation;
  //       //     },
  //       //   );
  //       //   return {
  //       //     ...oldData,
  //       //     conversations: updatedConversations,
  //       //     filterConversations: updatedConversations,
  //       //     selected: {
  //       //       ...oldData.selected,
  //       //       id: res.data,
  //       //     },
  //       //     quickChatAdd: false,
  //       //     fromListFriend: true,
  //       //   };
  //       // });

  //       queryClient.setQueryData(["conversation"], (oldData) => {
  //         const newConversation = {
  //           isGroup: false,
  //           isNotifying: true,
  //           id: res.data,
  //           members: [
  //             {
  //               isModerator: true,
  //               contact: {
  //                 id: info.id,
  //                 name: info.name,
  //                 avatar: info.avatar,
  //                 isOnline: true,
  //               },
  //             },
  //             {
  //               contact: {
  //                 id: contact.id,
  //                 name: contact.name,
  //                 avatar: contact.avatar,
  //                 isOnline: contact.isOnline,
  //               },
  //             },
  //           ],
  //         };
  //         return {
  //           ...oldData,
  //           conversations: [newConversation, ...oldData.conversations],
  //           filterConversations: [newConversation, ...oldData.conversations],
  //           selected: newConversation,
  //           quickChatAdd: true,
  //         };
  //       });
  //     });

  //     // queryClient.setQueryData(["conversation"], (oldData) => {
  //     //   const newConversation = {
  //     //     isGroup: false,
  //     //     isNotifying: true,
  //     //     id: randomId,
  //     //     members: [
  //     //       {
  //     //         isModerator: true,
  //     //         contact: {
  //     //           id: info.id,
  //     //           name: info.name,
  //     //           avatar: info.avatar,
  //     //           isOnline: true,
  //     //         },
  //     //       },
  //     //       {
  //     //         contact: {
  //     //           id: contact.id,
  //     //           name: contact.name,
  //     //           avatar: contact.avatar,
  //     //           isOnline: contact.isOnline,
  //     //         },
  //     //       },
  //     //     ],
  //     //   };
  //     //   return {
  //     //     ...oldData,
  //     //     conversations: [newConversation, ...oldData.conversations],
  //     //     filterConversations: [newConversation, ...oldData.conversations],
  //     //     selected: newConversation,
  //     //     quickChatAdd: true,
  //     //   };
  //     // });
  //   }
  //   onClose();
  // };

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
        padding="py-[.3rem]"
        gradientWidth="110%"
        gradientHeight="120%"
        rounded="3rem"
        onClick={() => {
          chat(friend);
        }}
      />
    ),
  }[friend.friendStatus];
};

export default FriendCtaButton;
