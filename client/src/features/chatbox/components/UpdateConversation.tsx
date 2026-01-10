import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../../../components/MediaPicker";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import { AttachmentModel, ConversationCache } from "../../listchat/types";
import { uploadFile } from "../functions/uploadFile";
import updateConversation from "../services/updateConversation";
import { UpdateConversationProps, UpdateConversationRequest } from "../types";

const UpdateConversation = (props: UpdateConversationProps) => {
  const { selected, onClose } = props;

  if (!selected) return;

  const queryClient = useQueryClient();

  const refInput = useRef<HTMLInputElement>();

  const [avatar, setAvatar] = useState<string>(selected.avatar);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    refInput.current.focus();
    refInput.current.value = selected.title;
  }, []);

  const updateConversationCTA = async () => {
    if (refInput.current.value === null || refInput.current.value === "")
      return;

    let url = "";
    if (file === undefined) {
      url = avatar;
    } else {
      const uploaded: AttachmentModel[] = await uploadFile(new Array(file));
      url = uploaded[0].mediaUrl;
    }

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const updatedConversations = oldData.conversations.map((conversation) => {
        if (conversation.id !== selected.id) return conversation;
        return {
          ...conversation,
          title: refInput.current.value,
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
      id: selected.id,
      title: refInput.current.value,
      avatar: url,
    };
    updateConversation(request);

    onClose();
  };

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setAvatar(URL.createObjectURL(e.target.files?.[0]));
    setFile(e.target.files?.[0]);
    e.target.value = null;
  };

  return (
    <div className="flex flex-col gap-12 p-5 pt-10">
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
      <CustomButton
        className="text-2xs mr-0"
        width={4}
        gradientWidth={`${isPhoneScreen() ? "115%" : "110%"}`}
        gradientHeight={`${isPhoneScreen() ? "130%" : "120%"}`}
        rounded="3rem"
        title="Save"
        onClick={updateConversationCTA}
        sm
      />
    </div>
  );
};

export default UpdateConversation;
