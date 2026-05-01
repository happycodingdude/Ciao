import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useFriend from "../../hooks/useFriend";
import useInfo from "../../hooks/useInfo";
import { createDirectChatWithMessage } from "../../services/friend.service";
import { sendMessage } from "../../services/message.service";
import { ConversationCache, ConversationModel } from "../../types/conv.types";
import { ContactModel } from "../../types/friend.types";
import {
  AttachmentCache,
  MessageCache,
  PendingMessageModel,
  SendMessageRequest,
} from "../../types/message.types";
import {
  buildOptimisticConversation,
  optimisticId,
  prependConversation,
  replaceConversationId,
  reopenMember,
  syncConversations,
} from "../../utils/conversationCache";
import { getToday } from "../../utils/datetime";
import delay from "../../utils/delay";
import { isPhoneScreen } from "../../utils/getScreenSize";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ListFriendLoading from "../common/ListFriendLoading";

const ForwardMessageModal = ({
  message,
  forward,
  directContact,
}: {
  message: PendingMessageModel;
  forward?: boolean;
  directContact?: string;
}) => {
  const { type, content, attachments } = message;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching } = useFriend();

  const refInput = useRef<HTMLInputElement | undefined>(undefined);

  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>(
    data
      ?.filter((item) => item.contact.id !== directContact)
      .map((item) => item.contact) ?? [],
  );
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(
      data
        .filter((item) => item.contact.id !== directContact)
        .map((item) => item.contact),
    );
    refInput.current?.focus();
  }, [data]);

  const send = async (contact: ContactModel) => {
    setSentIds((prev) => new Set(prev).add(contact.id ?? ""));

    const tempId = optimisticId();
    const existedConversation = (conversations?.conversations ?? []).find(
      (conv) =>
        conv.isGroup === false &&
        (conv.members ?? []).some((mem) => mem.contact?.id === contact.id) &&
        (conv.members ?? []).some((mem) => mem.contact?.id === info?.id),
    );
    if (existedConversation) {
      await handleExistedConversation(existedConversation);
    } else {
      await handleNewConversation(contact, tempId);
    }
  };

  const handleExistedConversation = async (conversation: ConversationModel) => {
    queryClient.setQueryData<ConversationCache>(["conversation"], (oldData) => {
      if (!oldData) return oldData;

      const now = dayjs().format();
      const convs = oldData.conversations ?? [];
      const cachedConv = convs.find((c) => c.id === conversation.id) ?? conversation;

      const isDeletedConversation =
        (cachedConv.members ?? []).find((mem) => mem.contact?.id === info?.id)
          ?.isDeleted ?? false;

      const lastMsg =
        attachments && attachments.length > 0 && !content
          ? attachments.map((att) => att.mediaName).join(",")
          : content;

      const updatedConv = {
        ...cachedConv,
        lastMessage: lastMsg,
        lastMessageTime: now,
        members: reopenMember(cachedConv.members ?? [], info?.id ?? ""),
      };

      return isDeletedConversation
        ? prependConversation(oldData, updatedConv)
        : syncConversations(
            oldData,
            convs.map((c) => (c.id !== cachedConv.id ? c : updatedConv)),
          );
    });

    const randomId = optimisticId();
    const hasMedia = !!(attachments && attachments.length > 0);

    queryClient.setQueryData(
      ["message", conversation.id],
      (oldData: MessageCache) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [
            ...(oldData.messages || []),
            {
              id: randomId,
              type,
              content,
              contactId: info?.id,
              attachments: hasMedia ? attachments : [],
              pending: true,
              likeCount: 0,
              loveCount: 0,
              careCount: 0,
              wowCount: 0,
              sadCount: 0,
              angryCount: 0,
              currentReaction: null,
              createdTime: dayjs().format(),
              isForwarded: forward ?? false,
            } as PendingMessageModel,
          ],
        } as MessageCache;
      },
    );

    if (hasMedia) {
      queryClient.setQueryData(
        ["attachment", conversation.id],
        (oldData: AttachmentCache) => {
          if (!oldData) return oldData;

          const today = getToday("MM/DD/YYYY");
          if (!oldData.attachments) {
            return {
              ...oldData,
              attachments: [{ date: today, attachments: attachments ?? [] }],
            } as AttachmentCache;
          }
          const existingItem = oldData.attachments.find((item) => item.date === today);
          if (!existingItem) {
            return {
              ...oldData,
              attachments: [
                ...oldData.attachments,
                { date: today, attachments: attachments ?? [] },
              ],
            } as AttachmentCache;
          }
          return {
            ...oldData,
            attachments: oldData.attachments.map((item) =>
              item.date === today
                ? { ...item, attachments: [...(attachments ?? []), ...item.attachments] }
                : item,
            ),
          } as AttachmentCache;
        },
      );
    }

    const bodyToCreate: SendMessageRequest = {
      type: type ?? "",
      content: content ?? "",
      attachments,
      isForwarded: forward ?? false,
    };
    const res = await sendMessage(conversation.id ?? "", bodyToCreate);
    await delay(500);

    queryClient.setQueryData(
      ["message", conversation.id],
      (oldData: MessageCache) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: (oldData.messages ?? []).map((msg) =>
            msg.id !== randomId ? msg : { ...msg, id: res?.messageId, pending: false },
          ),
        } as MessageCache;
      },
    );
  };

  const handleNewConversation = async (contact: ContactModel, tempId: string) => {
    const lastMsg =
      attachments && attachments.length > 0 && !content
        ? attachments.map((att) => att.mediaName).join(",")
        : content;

    const newConversation = buildOptimisticConversation(tempId, info!, contact, {
      lastMessage: lastMsg,
    });

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) =>
      prependConversation(oldData, newConversation),
    );

    createDirectChatWithMessage(contact.id ?? "", {
      message: content ?? undefined,
      isForwarded: forward ?? false,
    }).then((res) => {
      if (!res) return;
      queryClient.setQueryData(["conversation"], (oldData: ConversationCache) =>
        replaceConversationId(oldData, tempId, res.conversationId ?? ""),
      );

      const hasMedia = !!(attachments && attachments.length > 0);
      queryClient.setQueryData(
        ["message", res.conversationId],
        (_oldData: MessageCache) => ({
          messages: [
            {
              id: res.messageId,
              type,
              content,
              contactId: info?.id,
              attachments: hasMedia ? attachments : [],
              pending: false,
              likeCount: 0,
              loveCount: 0,
              careCount: 0,
              wowCount: 0,
              sadCount: 0,
              angryCount: 0,
              currentReaction: null,
              createdTime: dayjs().format(),
              isForwarded: forward ?? false,
            } as PendingMessageModel,
          ],
        } as MessageCache),
      );
      if (hasMedia) {
        queryClient.setQueryData(["attachment", res.conversationId], () => ({
          attachments: [
            { date: getToday("MM/DD/YYYY"), attachments: attachments ?? [] },
          ],
        } as AttachmentCache));
      }
    });
  };

  return (
    <>
      <CustomInput
        type="text"
        placeholder="Search for name"
        inputRef={refInput}
        onChange={(e) => {
          if (e.target.value === "")
            setMembersToSearch((data ?? []).map((item) => item.contact));
          else
            setMembersToSearch((current) =>
              current.filter((item) =>
                (item.name ?? "").toLowerCase().includes(e.target.value.toLowerCase()),
              ),
            );
        }}
      />
      <div
        className={`relative flex grow gap-8 ${isPhoneScreen() ? "flex-col" : "flex-row"}`}
      >
        {isLoading || isRefetching ? (
          <ListFriendLoading />
        ) : (
          <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col overflow-y-scroll scroll-smooth">
            {membersToSearch?.map((item) => {
              const isSent = sentIds.has(item.id ?? "");
              return (
                <div
                  key={item.id}
                  className="information-members flex w-full items-center gap-4 rounded-lg p-[.7rem]"
                >
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar ?? undefined}
                    className="phone:w-12 laptop:w-16 pointer-events-none aspect-square"
                    circle
                    slides={[{ src: item.avatar ?? "" }]}
                    onClick={() => {}}
                    local
                  />
                  <CustomLabel title={item.name} className="pointer-events-none" />
                  <CustomButton
                    className={`text-2xs ${isSent ? "pointer-events-none opacity-50" : ""}`}
                    width={4}
                    gradientWidth={isPhoneScreen() ? "115%" : "110%"}
                    gradientHeight={isPhoneScreen() ? "130%" : "120%"}
                    rounded="3rem"
                    title="Send"
                    onClick={() => send(item)}
                    sm
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ForwardMessageModal;
