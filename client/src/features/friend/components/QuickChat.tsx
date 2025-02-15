import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef } from "react";
import CustomContentEditable from "../../../components/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useEventListener from "../../../hooks/useEventListener";
import useLoading from "../../../hooks/useLoading";
import delay from "../../../utils/delay";
import useInfo from "../../authentication/hooks/useInfo";
import sendMessage from "../../chatbox/services/sendMessage";
import useConversation from "../../listchat/hooks/useConversation";
import {
  ConversationCache,
  ConversationModel,
  MessageCache,
} from "../../listchat/types";
import sendQuickChat from "../services/sendQuickChat";
import { QuickChatProps } from "../types";
import FriendCtaButton from "./FriendCtaButton";

const QuickChat = (props: QuickChatProps) => {
  // console.log("QuickChat calling");
  const { rect, offset, profile, onClose } = props;

  const queryClient = useQueryClient();

  const { setLoading } = useLoading();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const refQuickProfile = useRef<HTMLDivElement>();
  const refInput = useRef<HTMLInputElement>();

  useEffect(() => {
    if (!profile || !rect) return;

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
  }, [profile, rect]);

  const chat = async () => {
    onClose();
    const content = refInput.current.textContent;
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = conversations.conversations.find(
      (conv) =>
        conv.isGroup === false &&
        conv.members.some((mem) => mem.contact.id === profile.id),
    );
    if (existedConversation) {
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          // Move existed conversation to the top if the conversation was deleted
          // else keep the current position of the conversation
          let isDeletedConversation = existedConversation.members.find(
            (mem) => mem.contact.id === info.id,
          ).isDeleted;
          let updatedConversations = [];
          if (isDeletedConversation) {
            existedConversation.lastMessage = content;
            existedConversation.members = existedConversation.members.map(
              (mem) => {
                if (mem.contact.id !== info.id) return mem;
                return { ...mem, isDeleted: false };
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
              conv.lastMessage = content;
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
            selected: existedConversation,
            reload: true,
            quickChat: true,
            message: {
              id: randomId,
              contactId: info.id,
              type: "text",
              content: content,
              currentReaction: null,
              pending: true,
            },
          } as ConversationCache;
        },
      );
      const bodyToCreate = {
        type: "text",
        content: content,
      };
      sendMessage(existedConversation.id, bodyToCreate, 1000).then((res) => {
        queryClient.setQueryData(["message"], (oldData: MessageCache) => {
          const updatedMessages = oldData.messages.map((message) => {
            if (message.id !== randomId) return message;
            return { ...message, id: res, pending: false };
          });
          return {
            ...oldData,
            messages: updatedMessages,
          } as MessageCache;
        });
      });
    } else {
      setLoading(true);

      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const newConversation: ConversationModel = {
            id: randomId,
            lastMessage: content,
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
                  id: profile.id,
                  name: profile.name,
                  avatar: profile.avatar,
                  isOnline: profile.isOnline,
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

      sendQuickChat(profile.id, content).then((res) => {
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
              selected: {
                ...oldData.selected,
                id: res.conversationId,
              },
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
      });

      // Delay for smooth processing animation
      await delay(500);
      queryClient.setQueryData(["message"], (oldData: MessageCache) => {
        return {
          ...oldData,
          messages: [
            {
              id: randomId,
              contactId: info.id,
              type: "text",
              content: content,
              currentReaction: null,
              pending: true,
            },
          ],
          hasMore: false,
        } as MessageCache;
      });
      queryClient.setQueryData(["attachment"], (oldData) => {
        return [];
      });

      setLoading(false);
    }
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

  return (
    <div
      ref={refQuickProfile}
      className="quick-profile fixed right-[-40rem] aspect-[1/0.9] rounded-[.5rem] laptop:w-[25rem]"
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute right-[5%] top-[5%]">
          <FriendCtaButton friend={profile} onClose={() => {}} />
        </div>
        <div className="basis-[40%] rounded-t-[.5rem] bg-[var(--main-color-extrathin)]"></div>
        <div className="relative flex grow flex-col justify-evenly rounded-b-[.5rem] bg-[var(--main-color-light)] px-4 pt-16">
          <div className="absolute left-[1rem] top-[-4rem] rounded-[50%] bg-[var(--main-color-light)] p-[.5rem]">
            <ImageWithLightBoxAndNoLazy
              src={profile?.avatar}
              className="loaded aspect-square cursor-pointer rounded-[50%] bg-[size:170%] laptop:w-[7rem]"
              slides={[
                {
                  src: profile?.avatar,
                },
              ]}
              // onClick={() => {}}
            />
          </div>
          <p className="text-md font-medium">{profile?.name}</p>
          {/* <ChatInput
            // className="grow-0"
            quickChat
            noMenu
            noEmoji
            send={(content) => {
              chat(profile, content);
            }}
            inputRef={refInput}
          /> */}
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
