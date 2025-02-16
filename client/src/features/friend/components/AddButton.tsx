import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import CustomButton from "../../../components/CustomButton";
import HttpRequest from "../../../lib/fetch";
import { FriendCtaButtonProps } from "../../../types";

const AddButton = (props: FriendCtaButtonProps) => {
  const { id, onClose } = props;

  const queryClient = useQueryClient();

  const [processing, setProcessing] = useState<boolean>(false);

  const addFriend = () => {
    setProcessing(true);
    HttpRequest<undefined, string>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_ADD.replace(
        "{contact-id}",
        id,
      ),
    })
      .then((res) => {
        // queryClient.setQueryData(
        //   ["conversation"],
        //   (oldData: ConversationCache) => {
        //     const updatedConversations = oldData.conversations.map(
        //       (conversation) => {
        //         let member = conversation.members.some(
        //           (mem) => mem.contact.id === id,
        //         );
        //         if (!member) return conversation;
        //         return {
        //           ...conversation,
        //           members: conversation.members.map((mem) => {
        //             if (mem.contact.id !== id) return mem;
        //             return {
        //               ...mem,
        //               friendId: res.data,
        //               friendStatus: "request_sent",
        //             };
        //           }),
        //         };
        //       },
        //     );
        //     return {
        //       ...oldData,
        //       conversations: updatedConversations,
        //       filterConversations: updatedConversations,
        //       selected: {
        //         ...oldData.selected,
        //         members: oldData.selected?.members.map((mem) => {
        //           if (mem.contact.id !== id) return mem;
        //           return {
        //             ...mem,
        //             friendId: res.data,
        //             friendStatus: "request_sent",
        //           };
        //         }),
        //       },
        //     } as ConversationCache;
        //   },
        // );
        onClose(res.data);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <CustomButton
      title="Add"
      className={`!mr-0 laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
      padding="py-[.3rem]"
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={addFriend}
      processing={processing}
    />
  );
};

export default AddButton;
