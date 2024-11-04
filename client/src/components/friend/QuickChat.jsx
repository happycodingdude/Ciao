import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useConversation,
  useEventListener,
  useInfo,
} from "../../hook/CustomHooks";
import { send } from "../../hook/MessageAPIs";
import ChatInput from "../chat/ChatInput";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import FriendCtaButton from "./FriendCtaButton";

const QuickChat = (props) => {
  console.log("QuickChat calling");
  const { rect, offset, profile, onClose } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const refQuickProfile = useRef();
  const refInput = useRef();

  useEffect(() => {
    if (!profile || !rect) return;

    refInput.current.focus();
    refInput.current.textContent = "";

    // Adjust offset as needed to center redBox vertically over the clicked item
    let offsetTop = rect.top - refQuickProfile.current.offsetHeight / 3;
    const maxTopPosition =
      window.innerHeight +
      window.scrollY -
      refQuickProfile.current.offsetHeight;
    offsetTop = Math.min(offsetTop, maxTopPosition);

    refQuickProfile.current.style.top = offsetTop + "px";

    // Position the popup
    refQuickProfile.current.style.right = `${window.scrollY + offset}px`; // Position horizontally based on target
  }, [profile, rect]);

  const chat = async (contact, content) => {
    const existedConversation = conversations.conversations.find(
      (item) =>
        item.isGroup === false &&
        item.participants.some((item) => item.contact.id === contact.id),
    );
    if (existedConversation) {
      queryClient.setQueryData(["conversation"], (oldData) => {
        const cloned = Object.assign({}, oldData);
        const updatedConversations = cloned.conversations.map(
          (conversation) => {
            if (conversation.id !== existedConversation.id) return conversation;
            conversation.lastMessage = content;
            return conversation;
          },
        );
        return {
          ...oldData,
          conversations: updatedConversations,
          selected: existedConversation,
          selectAndAddMessage: true,
          message: {
            contactId: info.data.id,
            type: "text",
            content: content,
          },
        };
      });

      const bodyToCreate = {
        moderator: existedConversation.participants.find(
          (q) => q.isModerator === true,
        ).contact.id,
        type: "text",
        content: content,
      };
      await send(existedConversation.id, bodyToCreate);
    } else {
      let randomId = Math.random().toString(36).substring(2, 7);

      HttpRequest({
        method: "post",
        url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
          "{contact-id}",
          contact.id,
        ).replace("{message}", content),
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
              id: res.data,
            },
          };
        });
        queryClient.setQueryData(["message"], (oldData) => {
          return {
            ...oldData,
            id: res.data,
          };
        });
      });

      queryClient.setQueryData(["conversation"], (oldData) => {
        return {
          ...oldData,
          conversations: [
            {
              lastMessage: content,
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
          },
          quickChatAdd: true,
        };
      });
      queryClient.setQueryData(["message"], (oldData) => {
        return {
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
          messages: [
            {
              contactId: info.data.id,
              type: "text",
              content: content,
            },
          ],
        };
      });
    }
    onClose();
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
      className="quick-profile fixed right-[-40rem] aspect-[1/0.9] rounded-[.5rem] bg-[var(--bg-color)] laptop:w-[25rem]"
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute right-[5%] top-[5%]">
          <FriendCtaButton friend={profile} onClose={() => {}} />
        </div>
        <div className="basis-[40%] rounded-t-[.5rem] bg-[var(--main-color-extrabold)]"></div>
        <div className="relative flex grow flex-col justify-evenly rounded-b-[.5rem] bg-[var(--main-color-bold)] px-4 pt-16">
          <div className="absolute left-[1rem] top-[-4rem] rounded-[50%] bg-[var(--main-color-bold)] p-[.5rem]">
            <ImageWithLightBoxAndNoLazy
              src={profile?.avatar}
              className="aspect-square cursor-pointer rounded-[50%] laptop:w-[7rem]"
              slides={[
                {
                  src: profile?.avatar,
                },
              ]}
              onClick={(e) => {}}
            />
          </div>
          <p className="text-md font-medium">{profile?.name}</p>
          <ChatInput
            className="grow-0"
            quickChat
            noMenu
            send={(content) => {
              chat(profile, content);
            }}
            ref={refInput}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
