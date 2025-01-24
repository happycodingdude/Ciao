import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import useEventListener from "../../../hooks/useEventListener";
import useInfo from "../../authentication/hooks/useInfo";
import ChatInput from "../../chatbox/components/ChatInput";
import sendMessage from "../../chatbox/services/sendMessage";
import useConversation from "../../listchat/hooks/useConversation";
import sendQuickChat from "../services/sendQuickChat";
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

    // If the offsetTop is less than 0, set the top to 0
    refQuickProfile.current.style.top =
      offsetTop < 0 ? "0px" : offsetTop + "px";

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
        const updatedConversations = oldData.conversations.map(
          (conversation) => {
            if (conversation.id !== existedConversation.id) return conversation;
            conversation.lastMessage = content;
            return conversation;
          },
        );
        return {
          ...oldData,
          conversations: updatedConversations,
          filterConversations: updatedConversations,
          selected: existedConversation,
          clickAndAddMessage: true,
          message: {
            contactId: info.id,
            type: "text",
            content: content,
            currentReaction: null,
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
      await sendMessage(existedConversation.id, bodyToCreate);
    } else {
      let randomId = Math.random().toString(36).substring(2, 7);

      sendQuickChat(contact.id, content).then((res) => {
        // queryClient.setQueryData(["conversation"], (oldData) => {
        //   const updatedConversations = oldData.conversations.map(
        //     (conversation) => {
        //       if (conversation.id !== randomId) return conversation;
        //       conversation.id = res.data;
        //       return conversation;
        //     },
        //   );
        //   return {
        //     ...oldData,
        //     conversations: updatedConversations,
        //     filterConversations: updatedConversations,
        //     selected: {
        //       ...oldData.selected,
        //       id: res.data,
        //     },
        //     // quickChatAdd: false,
        //   };
        // });
        // queryClient.setQueryData(["message"], (oldData) => {
        //   return {
        //     ...oldData,
        //     id: res.data,
        //   };
        // });

        queryClient.setQueryData(["conversation"], (oldData) => {
          const newConversation = {
            lastMessage: content,
            isGroup: false,
            isNotifying: true,
            id: res.data,
            participants: [
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
            quickChatAdd: true,
            clickAndAddMessage: false,
            noLoading: true,
          };
        });
      });

      // queryClient.setQueryData(["conversation"], (oldData) => {
      //   const newConversation = {
      //     lastMessage: content,
      //     isGroup: false,
      //     isNotifying: true,
      //     id: randomId,
      //     participants: [
      //       {
      //         isModerator: true,
      //         contact: {
      //           id: info.id,
      //           name: info.name,
      //           avatar: info.avatar,
      //           isOnline: true,
      //         },
      //       },
      //       {
      //         contact: {
      //           id: contact.id,
      //           name: contact.name,
      //           avatar: contact.avatar,
      //           isOnline: contact.isOnline,
      //         },
      //       },
      //     ],
      //     noLazy: true,
      //   };
      //   return {
      //     ...oldData,
      //     conversations: [newConversation, ...oldData.conversations],
      //     filterConversations: [newConversation, ...oldData.conversations],
      //     selected: newConversation,
      //     quickChatAdd: true,
      //     clickAndAddMessage: false,
      //     noLoading: true,
      //   };
      // });
      // queryClient.setQueryData(["message"], (oldData) => {
      //   return {
      //     participants: [
      //       {
      //         isModerator: true,
      //         contact: {
      //           id: info.id,
      //           name: info.name,
      //           avatar: info.avatar,
      //           isOnline: true,
      //         },
      //       },
      //       {
      //         contact: {
      //           id: contact.id,
      //           name: contact.name,
      //           avatar: contact.avatar,
      //           isOnline: contact.isOnline,
      //         },
      //       },
      //     ],
      //     messages: [
      //       {
      //         contactId: info.id,
      //         type: "text",
      //         content: content,
      //         currentReaction: null,
      //       },
      //     ],
      //   };
      // });
      // queryClient.setQueryData(["attachment"], (oldData) => {
      //   return [];
      // });
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
              onClick={(e) => {}}
            />
          </div>
          <p className="text-md font-medium">{profile?.name}</p>
          <ChatInput
            className="grow-0"
            quickChat
            noMenu
            noEmoji
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
