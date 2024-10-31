import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useConversation,
  useEventListener,
  useInfo,
} from "../../hook/CustomHooks";
import ChatInput from "../chat/ChatInput";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import FriendCtaButton from "./FriendCtaButton";

const QuickChat = (props) => {
  console.log("QuickChat calling");
  const { rect, offset, profile, onClose } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const [show, setShow] = useState(false);

  const refQuickProfile = useRef();

  useEffect(() => {
    if (!profile && !rect) return;

    if (!profile) {
      setShow(false);
      return;
    }

    setShow(true);

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

  const chat = (contact) => {
    const existedConversation = conversations.conversations.find(
      (item) =>
        item.isGroup === false &&
        item.participants.some((item) => item.contact.id === contact.id),
    );
    if (existedConversation) {
      queryClient.setQueryData(["conversation"], (oldData) => {
        return { ...oldData, selected: existedConversation.id };
      });
    } else {
      HttpRequest({
        method: "post",
        url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
          "{contact-id}",
          contact.id,
        ),
      }).then((res) => {
        queryClient.setQueryData(["conversation"], (oldData) => {
          return {
            ...oldData,
            conversations: [
              {
                isGroup: false,
                isNotifying: true,
                id: res.data,
                participants: [
                  {
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
            selected: res.data,
          };
        });
      });
    }
    onClose();
  };

  // Event listener
  const closeQuickProfileOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      setShow(false);
    }
  }, []);
  useEventListener("keydown", closeQuickProfileOnKey);

  const closeQuickProfileOnClick = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (
      classList.some((item) => item === "quick-profile") ||
      classList.some((item) => item === "information-members")
    )
      return;
    setShowQuickProfile(false);
    refQuickProfile.current.style.right = "-40rem";
  }, []);
  useEventListener("click", closeQuickProfileOnClick);

  return (
    <div
      ref={refQuickProfile}
      data-show={show}
      className="quick-profile fixed right-[-40rem] aspect-[1/0.9] rounded-[.5rem] bg-[var(--bg-color)]
              data-[show=false]:opacity-0 data-[show=true]:opacity-100 laptop:w-[25rem]"
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
            send={() => {
              setShow(false);
              onClose();
              chat(profile);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
