import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import CustomContentEditable from "../../../components/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useEventListener from "../../../hooks/useEventListener";
import useLoading from "../../../hooks/useLoading";
import useInfo from "../../authentication/hooks/useInfo";
import getMessages from "../../chatbox/services/getMessages";
import sendMessage from "../../chatbox/services/sendMessage";
import getAttachments from "../../chatdetail/services/getAttachments";
import useConversation from "../../listchat/hooks/useConversation";
import {
  AttachmentCache,
  ConversationCache,
  ConversationModel,
  MessageCache,
} from "../../listchat/types";
import createDirectChatWithMessage from "../services/createDirectChatWithMessage";
import { ContactModel, QuickChatProps } from "../types";
import FriendCtaButton from "./FriendCtaButton";

const QuickChat = (props: QuickChatProps) => {
  // console.log("QuickChat calling");
  const { rect, offset, profile, onClose } = props;

  if (!profile) return;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const refQuickProfile = useRef<HTMLDivElement>();
  const refInput = useRef<HTMLInputElement>();

  const [innerFriend, setInnerFriend] = useState<ContactModel>(profile);

  useEffect(() => {
    setInnerFriend(profile);
  }, [profile]);

  useEffect(() => {
    if (!innerFriend || !rect) return;

    // if (refInput.current) {
    refInput.current.textContent = "";
    refInput.current.focus();
    // }

    // Adjust offset as needed to center redBox vertically over the clicked item
    let offsetTop = rect.top - refQuickProfile.current.offsetHeight / 3;
    const maxTopPosition =
      window.innerHeight +
      window.scrollY -
      refQuickProfile.current.offsetHeight;
    offsetTop = Math.min(offsetTop, maxTopPosition);

    // If the offsetTop is less than 0, set the top to 0
    refQuickProfile.current.style.top =
      offsetTop < 0 ? "0px" : offsetTop + "px";

    // Position the popup
    refQuickProfile.current.style.right = `${window.scrollY + offset}px`; // Position horizontally based on target
  }, [innerFriend, rect]);

  const chat = async () => {
    onClose();
    const message = refInput.current.textContent;
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = conversations.conversations.find(
      (conv) => conv.id === innerFriend.directConversation,
    );
    if (existedConversation) {
      handleExistedConversation(existedConversation, message, randomId);
    } else {
      handleNewConversation(message, randomId);
    }
  };

  const handleExistedConversation = async (
    conversation: ConversationModel,
    message: string,
    randomId: string,
  ) => {
    // Check if cache exists first, if not then fetch
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
        getMessages(conversation.id, 1),
        getAttachments(conversation.id),
      ]);
    }

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      // Move existed conversation to the top if the conversation was deleted
      // else keep the current position of the conversation
      let isDeletedConversation = conversation.members.find(
        (mem) => mem.contact.id === info.id,
      ).isDeleted;
      let updatedConversations = [];
      if (isDeletedConversation) {
        conversation.lastMessage = message;
        conversation.lastMessageTime = moment().format();
        conversation.members = conversation.members.map((mem) => {
          if (mem.contact.id !== info.id) return mem;
          return { ...mem, isDeleted: false };
        });
        updatedConversations = [
          conversation,
          ...oldData.conversations.filter(
            (conv) => conv.id !== conversation.id,
          ),
        ];
      } else {
        updatedConversations = oldData.conversations.map((conv) => {
          if (conv.id !== conversation.id) return conv;
          conv.lastMessage = message;
          conv.lastMessageTime = moment().format();
          conv.members = conv.members.map((mem) => {
            if (mem.contact.id !== info.id) return mem;
            return { ...mem, isDeleted: false };
          });
          return conv;
        });
      }

      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
      } as ConversationCache;
    });

    // Push message first
    messages.messages.push({
      id: randomId,
      contactId: info.id,
      type: "text",
      content: message,
      currentReaction: null,
      pending: true,
      createdTime: moment().format(),
    });
    queryClient.setQueryData(["message", conversation.id], messages);
    queryClient.setQueryData(["attachment", conversation.id], attachments);

    // Then navigate to the conversation
    navigate({ to: `/conversations/${conversation.id}` });

    const bodyToCreate = {
      type: "text",
      content: message,
    };
    sendMessage(conversation.id, bodyToCreate, 1000).then((res) => {
      queryClient.setQueryData(
        ["message", conversation.id],
        (oldData: MessageCache) => {
          const updatedMessages = oldData.messages.map((message) => {
            if (message.id !== randomId) return message;
            return { ...message, id: res.messageId, pending: false };
          });
          return {
            ...oldData,
            messages: updatedMessages,
          } as MessageCache;
        },
      );
    });
  };

  const handleNewConversation = async (message: string, randomId: string) => {
    setLoading(true);

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const newConversation: ConversationModel = {
        id: randomId,
        lastMessage: message,
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
              id: innerFriend.id,
              name: innerFriend.name,
              avatar: innerFriend.avatar,
              isOnline: innerFriend.isOnline,
            },
          },
        ],
      };
      return {
        ...oldData,
        conversations: [newConversation, ...oldData.conversations],
        filterConversations: [newConversation, ...oldData.conversations],
        // selected: newConversation,
        // reload: false,
      } as ConversationCache;
    });

    createDirectChatWithMessage(innerFriend.id, message).then((res) => {
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const updatedConversations = oldData.conversations.map(
            (conversation) => {
              if (conversation.id !== randomId) return conversation;
              return { ...conversation, id: res.conversationId };
            },
          );
          return {
            ...oldData,
            conversations: updatedConversations,
            filterConversations: updatedConversations,
            // selected: {
            //   ...oldData.selected,
            //   id: res.conversationId,
            // },
          } as ConversationCache;
        },
      );
      queryClient.setQueryData(["message"], (oldData: MessageCache) => {
        const updatedMessages = oldData.messages.map((message) => {
          if (message.id !== randomId) return message;
          return { ...message, id: res.messageId, pending: false };
        });
        return {
          ...oldData,
          messages: updatedMessages,
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
    // await delay(500);
    queryClient.setQueryData(["message"], (oldData: MessageCache) => {
      return {
        ...oldData,
        messages: [
          {
            id: randomId,
            contactId: info.id,
            type: "text",
            content: message,
            currentReaction: null,
            pending: true,
          },
        ],
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
  };

  const keydownBindingFn = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      chat();
    }
  };

  // Event listener
  const closeQuickProfileOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      refQuickProfile.current.style.right = "-40rem";
    }
  }, []);
  useEventListener("keydown", closeQuickProfileOnKey);

  const closeQuickProfileOnClick = useCallback((e) => {
    if (
      e.target.closest(".quick-profile") ||
      e.target.closest(".information-members")
    )
      return;
    refQuickProfile.current.style.right = "-40rem";
  }, []);
  useEventListener("click", closeQuickProfileOnClick);

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
  ): void => {
    setInnerFriend((current) => {
      return {
        ...current,
        friendId: id,
        friendStatus: status === "friend" ? null : status,
      };
    });
  };

  return (
    <div
      ref={refQuickProfile}
      className="quick-profile fixed right-[-40rem] aspect-[1/0.9] rounded-[.5rem] laptop:w-[25rem]"
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute right-[5%] top-[5%]">
          <FriendCtaButton
            friend={innerFriend}
            friendAction={handleFriendAction}
          />
        </div>
        <div className="basis-[40%] rounded-t-[.5rem] bg-[var(--main-color-extrathin)]"></div>
        <div className="relative flex grow flex-col justify-evenly rounded-b-[.5rem] bg-[var(--main-color-light)] px-4 pt-16">
          <div className="absolute left-[1rem] top-[-4rem] rounded-[50%] bg-[var(--main-color-light)] p-[.5rem]">
            <ImageWithLightBoxAndNoLazy
              src={innerFriend?.avatar}
              className="loaded aspect-square cursor-pointer rounded-[50%] bg-[size:170%] laptop:w-[7rem]"
              slides={[
                {
                  src: innerFriend?.avatar,
                },
              ]}
            />
          </div>
          <p className="text-md font-medium">{innerFriend?.name}</p>
          <div className="rounded-[.5rem] bg-[var(--bg-color)] py-[.5rem]">
            <CustomContentEditable
              ref={refInput}
              className=" px-[.5rem]"
              onKeyDown={keydownBindingFn}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
