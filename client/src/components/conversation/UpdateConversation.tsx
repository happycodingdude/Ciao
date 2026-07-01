import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateConversation } from "../../services/conv.service";
import {
  ConversationCache,
  UpdateConversationProps,
  UpdateConversationRequest,
} from "../../types/conv.types";
import { AttachmentModel } from "../../types/message.types";
import { uploadFile } from "../../utils/uploadFile";
import CustomInput from "../common/CustomInput";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../common/MediaPicker";
import ModalFooter from "../common/ModalFooter";

const UpdateConversation = (props: UpdateConversationProps) => {
  const { selected, onClose } = props;

  const queryClient = useQueryClient();

  const refInput = useRef<HTMLInputElement | undefined>(undefined);

  const [avatar, setAvatar] = useState<string>(selected?.avatar ?? "");
  const [file, setFile] = useState<File>();

  useEffect(() => {
    refInput.current?.focus();
    if (refInput.current) refInput.current.value = selected?.title ?? "";
  }, [selected]);

  if (!selected) return null;

  const updateConversationCTA = async () => {
    if (!refInput.current?.value) return;

    let url = "";
    if (file === undefined) {
      url = avatar;
    } else {
      const uploaded: AttachmentModel[] = await uploadFile(new Array(file));
      url = uploaded[0].mediaUrl ?? "";
    }

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updatedConversations = (oldData.conversations ?? []).map((conversation) => {
        if (conversation.id !== selected.id) return conversation;
        return {
          ...conversation,
          title: refInput.current?.value ?? "",
          avatar: url,
        };
      });
      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
      } as ConversationCache;
    });
    const request: UpdateConversationRequest = {
      id: selected.id ?? "",
      title: refInput.current?.value ?? "",
      avatar: url,
    };
    updateConversation(request);

    onClose?.();
  };

  const chooseAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(e.target.files ?? []);
    if (chosenFiles.length === 0) return;

    setAvatar(URL.createObjectURL(e.target.files![0]));
    setFile(e.target.files![0]);
    e.target.value = "";
  };

  return (
    <div className="text-(--text-main-color) flex flex-col gap-5 px-6 pb-6 pt-2">
      <div className="relative flex items-end justify-evenly">
        <ImageWithLightBoxAndNoLazy
          src={avatar ?? ""}
          className="aspect-square w-20 cursor-pointer rounded-2xl"
          local
        />
        <MediaPicker
          className="absolute -top-4 left-28"
          accept="image/png, image/jpeg, image/webp"
          id="new-conversation-avatar"
          onChange={chooseAvatar}
        />
        <CustomInput
          type="text"
          inputRef={refInput}
          className="phone:w-[20rem] laptop:w-80"
          placeholder="Type group name"
        />
      </div>
      <ModalFooter onCancel={() => onClose?.()} onSave={updateConversationCTA} />
    </div>
  );
};

export default UpdateConversation;
