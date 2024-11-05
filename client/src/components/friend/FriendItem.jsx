import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useConversation, useInfo } from "../../hook/CustomHooks";
import ImageWithLightBox from "../common/ImageWithLightBox";
import FriendCtaButton from "./FriendCtaButton";

const FriendItem = (props) => {
  const { key, friend, setContacts, onClose } = props;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

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

  return (
    <div
      key={key}
      // data-key={friend.id}
      className="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-[var(--bg-color-light)]"
    >
      <ImageWithLightBox
        src={friend.avatar}
        className="aspect-square rounded-2xl laptop:w-[5rem]"
        spinnerClassName="laptop:bg-[size:2rem]"
        imageClassName="bg-[size:150%]"
        slides={[
          {
            src: friend.avatar,
          },
        ]}
      />
      <div className="flex h-full flex-col items-start">
        <p className="font-medium">{friend.name}</p>
        <p className="text-[var(--text-main-color-normal)]">{friend.Bio}</p>
      </div>
      <FriendCtaButton
        friend={friend}
        setContacts={setContacts}
        onClose={onClose}
      />
    </div>
  );
};

export default FriendItem;
