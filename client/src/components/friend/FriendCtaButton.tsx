import { useQueryClient } from "@tanstack/react-query";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import useLoading from "../../hooks/useLoading";
import { reopenMember } from "../../services/conv.service";
import { createDirectChat } from "../../services/friend.service";
import { FriendItemProps } from "../../types/base.types";
import { ConversationCache, ConversationModel } from "../../types/conv.types";
import { AttachmentCache, MessageCache } from "../../types/message.types";
import CustomButton from "../common/CustomButton";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendCtaButton = (props: FriendItemProps) => {
  const { friend, friendAction, onClose } = props;

  if (!friend) return null;

  const queryClient = useQueryClient();

  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const chat = async (contact: typeof friend) => {
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = (conversations?.conversations ?? []).find(
      (conv) =>
        conv.isGroup === false &&
        (conv.members ?? []).some((mem) => mem.contact?.id === contact.id),
    );
    if (existedConversation) {
      const isDeletedConversation = (existedConversation.members ?? []).find(
        (mem) => mem.contact?.id === info?.id,
      )?.isDeleted ?? false;
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          let updatedConversations: ConversationModel[] = [];
          if (isDeletedConversation) {
            existedConversation.members = (existedConversation.members ?? []).map(
              (mem) => {
                if (mem.contact?.id !== info?.id) return mem;
                mem.isDeleted = false;
                return mem;
              },
            );
            updatedConversations = [
              existedConversation,
              ...(oldData.conversations ?? []).filter(
                (conv) => conv.id !== existedConversation.id,
              ),
            ];
          } else {
            updatedConversations = (oldData.conversations ?? []).map((conv) => {
              if (conv.id !== existedConversation.id) return conv;
              conv.members = (conv.members ?? []).map((mem) => {
                if (mem.contact?.id !== info?.id) return mem;
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
            message: undefined,
          } as ConversationCache;
        },
      );
      if (isDeletedConversation) reopenMember(existedConversation.id ?? "");
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
                  id: info?.id,
                  name: info?.name,
                  avatar: info?.avatar,
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
            conversations: [newConversation, ...(oldData.conversations ?? [])],
            filterConversations: [newConversation, ...(oldData.conversations ?? [])],
            selected: newConversation,
            reload: false,
          } as ConversationCache;
        },
      );

      createDirectChat(contact.id ?? "").then((res) => {
        if (!res) return;
        queryClient.setQueryData(
          ["conversation"],
          (oldData: ConversationCache) => {
            const updatedConversations = (oldData.conversations ?? []).map(
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
            } as ConversationCache;
          },
        );
        queryClient.setQueryData(
          ["message", res.conversationId],
          (oldData: MessageCache) => {
            return {
              ...oldData,
              conversationId: res.conversationId,
            } as MessageCache;
          },
        );
        queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => {
          return {
            ...oldData,
            conversationId: res.conversationId,
          } as AttachmentCache;
        });
      });

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

    onClose?.();
  };

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
  ): void => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updatedConversations = (oldData.conversations ?? []).map((conversation) => {
        const member = (conversation.members ?? []).some(
          (mem) => mem.contact?.id === friend.id,
        );
        if (!member) return conversation;
        return {
          ...conversation,
          members: (conversation.members ?? []).map((mem) => {
            if (mem.contact?.id !== friend.id) return mem;
            return {
              ...mem,
              friendId: id,
              friendStatus: status,
            };
          }),
        };
      });
      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
      } as ConversationCache;
    });
    friendAction?.(id, status, friend.id);
  };

  const statusMap: Partial<Record<string, JSX.Element>> = {
    new: (
      <AddButton
        id={friend.id}
        onClose={(id?: string) => handleFriendAction(id, "request_sent")}
      />
    ),
    request_received: (
      <AcceptButton
        id={friend.friendId ?? undefined}
        onClose={() => handleFriendAction(friend.friendId, "friend")}
      />
    ),
    request_sent: (
      <CancelButton
        id={friend.friendId ?? undefined}
        onClose={() => handleFriendAction(null, "new")}
      />
    ),
    friend: (
      <CustomButton
        title="Chat"
        className="text-2xs"
        width={4}
        gradientWidth="110%"
        gradientHeight="120%"
        rounded="3rem"
        onClick={() => {
          chat(friend);
        }}
        sm
      />
    ),
  };

  return statusMap[friend.friendStatus ?? ""] ?? null;
};

export default FriendCtaButton;
