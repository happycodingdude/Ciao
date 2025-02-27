import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import CustomButton from "../../../components/CustomButton";
import useLoading from "../../../hooks/useLoading";
import { FriendItemProps } from "../../../types";
import delay from "../../../utils/delay";
import useInfo from "../../authentication/hooks/useInfo";
import reopenMember from "../../chatbox/services/reopenMember";
import useConversation from "../../listchat/hooks/useConversation";
import {
  AttachmentCache,
  ConversationCache,
  ConversationModel,
  MessageCache,
} from "../../listchat/types";
import createDirectChat from "../services/createDirectChat";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendCtaButton = (props: FriendItemProps) => {
  const { friend, friendAction } = props;

  if (!friend) return;

  const queryClient = useQueryClient();

  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const chat = async (contact) => {
    // onClose();
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = conversations.conversations.find(
      (conv) =>
        conv.isGroup === false &&
        conv.members.some((mem) => mem.contact.id === contact.id),
    );
    if (existedConversation) {
      let isDeletedConversation = existedConversation.members.find(
        (mem) => mem.contact.id === info.id,
      ).isDeleted;
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          // Move existed conversation to the top if the conversation was deleted
          // else keep the current position of the conversation

          let updatedConversations: ConversationModel[] = [];
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
            quickChat: false,
            message: null,
          } as ConversationCache;
        },
      );
      if (isDeletedConversation) reopenMember(existedConversation.id);
    } else {
      setLoading(true);

      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const newConversation: ConversationModel = {
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
          };

          return {
            ...oldData,
            conversations: [newConversation, ...oldData.conversations],
            filterConversations: [newConversation, ...oldData.conversations],
            selected: newConversation,
            reload: false,
          } as ConversationCache;
        },
      );

      createDirectChat(contact.id).then((res) => {
        queryClient.setQueryData(
          ["conversation"],
          (oldData: ConversationCache) => {
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
            } as ConversationCache;
          },
        );
        queryClient.setQueryData(["message"], (oldData: MessageCache) => {
          return {
            ...oldData,
            conversationId: res.conversationId,
          } as MessageCache;
        });
        queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => {
          return {
            ...oldData,
            conversationId: res.conversationId,
          } as AttachmentCache;
        });
      });

      // Delay for smooth processing animation
      await delay(500);
      queryClient.setQueryData(["message"], (oldData: MessageCache) => {
        return {
          ...oldData,
          conversationId: randomId,
          messages: [],
          hasMore: false,
        } as MessageCache;
      });
      queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => {
        return {
          ...oldData,
          conversationId: randomId,
          attachments: [],
        } as AttachmentCache;
      });

      setLoading(false);
    }
  };

  return {
    new: (
      <AddButton
        id={friend.id}
        onClose={(id: string) => friendAction(id, "request_sent")}
      />
    ),
    request_received: (
      <AcceptButton
        id={friend.friendId}
        onClose={() => friendAction(friend.friendId, "friend")}
      />
    ),
    request_sent: (
      <CancelButton
        id={friend.friendId}
        onClose={() => friendAction(null, "new")}
      />
    ),
    friend: (
      <CustomButton
        title="Chat"
        className={`!mr-0 laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
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
