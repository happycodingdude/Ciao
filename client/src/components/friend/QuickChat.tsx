import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import useLoading from "../../hooks/useLoading";
import { createDirectChatWithMessage } from "../../services/friend.service";
import {
  getAttachments,
  getMessages,
  sendMessage,
} from "../../services/message.service";
import { ConversationCache, ConversationModel } from "../../types/conv.types";
import { ContactModel, QuickChatProps } from "../../types/friend.types";
import { AttachmentCache, MessageCache } from "../../types/message.types";
import {
  buildOptimisticConversation,
  optimisticId,
  prependConversation,
  replaceConversationId,
  reopenMember,
  syncConversations,
} from "../../utils/conversationCache";
import CustomContentEditable from "../common/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import FriendCtaButton from "./FriendCtaButton";

const QuickChat = (props: QuickChatProps) => {
  const { rect, offset, profile, onClose } = props;

  const queryClient = useQueryClient();
  const router = useRouter();
  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const refQuickProfile = useRef<HTMLDivElement>(null);
  const refInput = useRef<HTMLDivElement>(null);

  const [innerFriend, setInnerFriend] = useState<ContactModel | undefined>(profile);

  useEffect(() => {
    setInnerFriend(profile);
  }, [profile]);

  useEffect(() => {
    if (!innerFriend || !rect) return;

    if (refInput.current) {
      refInput.current.textContent = "";
      refInput.current.focus();
    }

    if (!refQuickProfile.current) return;

    let offsetTop = rect.top - refQuickProfile.current.offsetHeight / 3;
    const maxTopPosition =
      window.innerHeight +
      window.scrollY -
      refQuickProfile.current.offsetHeight;
    offsetTop = Math.min(offsetTop, maxTopPosition);

    refQuickProfile.current.style.top =
      offsetTop < 0 ? "0px" : offsetTop + "px";
    refQuickProfile.current.style.right = `${window.scrollY + (offset ?? 0)}px`;
  }, [innerFriend, rect]);

  const closeQuickProfileOnKey = useCallback((e: Event) => {
    if ((e as KeyboardEvent).key === "Escape") {
      if (refQuickProfile.current) refQuickProfile.current.style.right = "-40rem";
    }
  }, []);
  useEventListener("keydown", closeQuickProfileOnKey);

  const closeQuickProfileOnClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".quick-profile") ||
      target.closest(".information-members")
    )
      return;
    if (refQuickProfile.current) refQuickProfile.current.style.right = "-40rem";
  }, []);
  useEventListener("click", closeQuickProfileOnClick);

  if (!profile) return null;

  const handleExistedConversation = async (
    conversation: ConversationModel,
    message: string,
    tempId: string,
  ) => {
    let messages = queryClient.getQueryData<MessageCache>([
      "message",
      conversation.id,
    ]);
    let attachments = queryClient.getQueryData<AttachmentCache>([
      "attachment",
      conversation.id,
    ]);

    if (!messages || !attachments) {
      [messages, attachments] = await Promise.all([
        getMessages(conversation.id ?? "", 1),
        getAttachments(conversation.id ?? ""),
      ]);
    }

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const isDeletedConversation =
        (conversation.members ?? []).find(
          (mem) => mem.contact?.id === info?.id,
        )?.isDeleted ?? false;

      const now = dayjs().format();
      const updatedConv = {
        ...conversation,
        lastMessage: message,
        lastMessageTime: now,
        members: reopenMember(conversation.members ?? [], info?.id ?? ""),
      };

      return isDeletedConversation
        ? prependConversation(oldData, updatedConv)
        : syncConversations(
            oldData,
            (oldData.conversations ?? []).map((conv) =>
              conv.id !== conversation.id ? conv : updatedConv,
            ),
          );
    });

    if (messages) {
      messages.messages.push({
        id: tempId,
        contactId: info?.id,
        type: "text",
        content: message,
        currentReaction: null,
        pending: true,
        createdTime: dayjs().format(),
      });
      queryClient.setQueryData(["message", conversation.id], messages);
    }
    if (attachments) {
      queryClient.setQueryData(["attachment", conversation.id], attachments);
    }

    router.navigate({ to: `/conversations/${conversation.id}` });

    sendMessage(conversation.id ?? "", { type: "text", content: message }, 1000).then(
      (res) => {
        if (!res) return;
        queryClient.setQueryData(
          ["message", conversation.id],
          (oldData: MessageCache) => ({
            ...oldData,
            messages: (oldData.messages ?? []).map((msg) =>
              msg.id !== tempId ? msg : { ...msg, id: res.messageId, pending: false },
            ),
          }),
        );
      },
    );
  };

  const handleNewConversation = async (message: string, tempId: string) => {
    setLoading(true);

    const newConversation = buildOptimisticConversation(tempId, info!, innerFriend!, {
      lastMessage: message,
    });

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) =>
      prependConversation(oldData, newConversation),
    );

    createDirectChatWithMessage(innerFriend!.id ?? "", { message }).then((res) => {
      if (!res) return;
      queryClient.setQueryData(["conversation"], (oldData: ConversationCache) =>
        replaceConversationId(oldData, tempId, res.conversationId ?? ""),
      );
      queryClient.setQueryData(["message"], (oldData: MessageCache) => ({
        ...oldData,
        messages: (oldData.messages ?? []).map((msg) =>
          msg.id !== tempId ? msg : { ...msg, id: res.messageId, pending: false },
        ),
      }));
      queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => ({
        ...oldData,
        conversationId: res.conversationId,
      }));
    });

    queryClient.setQueryData(["message"], (oldData: MessageCache) => ({
      ...oldData,
      messages: [
        {
          id: tempId,
          contactId: info?.id,
          type: "text",
          content: message,
          currentReaction: null,
          pending: true,
        },
      ],
      hasMore: false,
    }));
    queryClient.setQueryData(["attachment"], (oldData: AttachmentCache) => ({
      ...oldData,
      conversationId: tempId,
      attachments: [],
    }));

    setLoading(false);
  };

  const chat = async () => {
    const message = refInput.current?.textContent ?? "";
    const tempId = optimisticId();
    const existedConversation = (conversations?.conversations ?? []).find(
      (conv) => conv.id === innerFriend?.directConversation,
    );
    if (existedConversation) {
      handleExistedConversation(existedConversation, message, tempId);
    } else {
      handleNewConversation(message, tempId);
    }
    onClose?.();
  };

  const keydownBindingFn = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chat();
    }
  };

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
  ): void => {
    setInnerFriend((current) => ({
      ...current!,
      friendId: id ?? undefined,
      friendStatus: status === null ? undefined : status,
    }));
  };

  return (
    <div
      ref={refQuickProfile}
      className="quick-profile -right-160 laptop:w-70 fixed aspect-[1/0.9] rounded-lg"
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute right-[5%] top-[5%]">
          <FriendCtaButton
            friend={innerFriend}
            friendAction={handleFriendAction}
          />
        </div>
        <div className="bg-(--light-blue-300) basis-[40%] rounded-t-lg"></div>
        <div className="bg-(--light-blue-400) relative flex grow flex-col gap-4 rounded-b-lg px-4 pt-8">
          <div className="bg-(--light-blue-400) absolute -top-10 left-6 rounded-[50%] p-2">
            <ImageWithLightBoxAndNoLazy
              src={innerFriend?.avatar ?? undefined}
              className="loaded bg-size-[170%] laptop:w-15 aspect-square cursor-pointer rounded-[50%]"
              slides={[{ src: innerFriend?.avatar ?? "" }]}
            />
          </div>
          <p className="text-sm font-medium">{innerFriend?.name}</p>
          <div className="bg-(--bg-color) rounded-lg py-2">
            <CustomContentEditable
              ref={refInput}
              className=" px-2"
              onKeyDown={keydownBindingFn}
              quickChat
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
