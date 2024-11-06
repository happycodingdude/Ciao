import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";

const UpdateTitle = (props) => {
  const { id, title, avatar, onClose } = props;

  const queryClient = useQueryClient();

  const refInput = useRef();

  useEffect(() => {
    refInput.current.value = title;
    refInput.current.focus();
  }, []);

  const updateTitle = () => {
    if (refInput.current.value === null || refInput.current.value === "")
      return;

    queryClient.setQueryData(["conversation"], (oldData) => {
      const updatedConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== id) return conversation;
        return {
          ...conversation,
          title: refInput.current.value,
        };
      });
      return {
        ...oldData,
        conversations: updatedConversations,
        selected: {
          ...oldData.selected,
          title: refInput.current.value,
        },
      };
    });

    HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETBYID.replace(
        "{id}",
        id,
      ),
      data: {
        title: refInput.current.value,
        avatar: avatar,
      },
    });

    onClose();
  };

  return (
    <div className="flex flex-col gap-[3rem] p-10 pt-12 text-[90%]">
      <CustomInput type="text" reference={refInput} />
      <CustomButton
        className={`!mr-0 !p-[.2rem] laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
        leadingClass="leading-[2.5rem]"
        gradientClass="after:h-[115%] after:w-[107%]"
        title="Save"
        onClick={updateTitle}
      />
    </div>
  );
};

export default UpdateTitle;
