import { useQueryClient } from "@tanstack/react-query";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import useLoading from "../../hooks/useLoading";
import { reopenMember as callReopenMember } from "../../services/conv.service";
import { createDirectChat } from "../../services/friend.service";
import { FriendItemProps } from "../../types/base.types";
import { ConversationCache } from "../../types/conv.types";
import { AttachmentCache, MessageCache } from "../../types/message.types";
import {
  buildOptimisticConversation,
  findDirectConversation,
  optimisticId,
  prependConversation,
  reopenMember,
  replaceConversationId,
  syncConversations,
} from "../../utils/conversationCache";
import CustomButton from "../common/CustomButton";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendCtaButton = (props: FriendItemProps) => {
  const { friend, friendAction, onClose } = props;

  const queryClient = useQueryClient();
  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  if (!friend) return null;

  const chat = async (contact: typeof friend) => {
    const tempId = optimisticId();
    const existedConversation = findDirectConversation(
      conversations?.conversations ?? [],
      contact.id ?? "",
    );

    if (existedConversation) {
      const isDeletedConversation =
        (existedConversation.members ?? []).find(
          (mem) => mem.contact?.id === info?.id,
        )?.isDeleted ?? false;

      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const updatedConv = {
            ...existedConversation,
            members: reopenMember(existedConversation.members ?? [], info?.id ?? ""),
          };
          const base = isDeletedConversation
            ? prependConversation(oldData, updatedConv)
            : syncConversations(
                oldData,
                (oldData.conversations ?? []).map((conv) =>
                  conv.id !== existedConversation.id
                    ? conv
                    : { ...conv, members: reopenMember(conv.members ?? [], info?.id ?? "") },
                ),
              );
          return {
            ...base,
            selected: existedConversation,
            reload: true,
            quickChat: false,
            message: undefined,
          } as ConversationCache;
        },
      );

      if (isDeletedConversation) callReopenMember(existedConversation.id ?? "");
    } else {
      setLoading(true);

      const newConversation = buildOptimisticConversation(tempId, info!, contact);

      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => ({
          ...prependConversation(oldData, newConversation),
          selected: newConversation,
          reload: false,
        }),
      );

      createDirectChat(contact.id ?? "").then((res) => {
        if (!res) return;
        queryClient.setQueryData(
          ["conversation"],
          (oldData: ConversationCache) =>
            replaceConversationId(oldData, tempId, res.conversationId ?? ""),
        );
        queryClient.setQueryData(
          ["message", res.conversationId],
          (oldData: MessageCache) => ({
            ...oldData,
            conversationId: res.conversationId,
          }),
        );
        queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => ({
          ...oldData,
          conversationId: res.conversationId,
        }));
      });

      queryClient.setQueryData(["message"], (oldData: MessageCache) => ({
        ...oldData,
        conversationId: tempId,
        messages: [],
        hasMore: false,
      }));
      queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => ({
        ...oldData,
        conversationId: tempId,
        attachments: [],
      }));

      setLoading(false);
    }

    onClose?.();
  };

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
  ): void => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) =>
      syncConversations(
        oldData,
        (oldData.conversations ?? []).map((conversation) => {
          const isMember = (conversation.members ?? []).some(
            (mem) => mem.contact?.id === friend.id,
          );
          if (!isMember) return conversation;
          return {
            ...conversation,
            members: (conversation.members ?? []).map((mem) => {
              if (mem.contact?.id !== friend.id) return mem;
              return { ...mem, friendId: id ?? undefined, friendStatus: status ?? undefined };
            }),
          };
        }),
      ),
    );
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
        onClick={() => chat(friend)}
        sm
      />
    ),
  };

  return statusMap[friend.friendStatus ?? ""] ?? null;
};

export default FriendCtaButton;
