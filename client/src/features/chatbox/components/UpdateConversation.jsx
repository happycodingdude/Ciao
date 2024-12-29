import { useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../common/MediaPicker";

const UpdateConversation = (props) => {
  const { selected, onClose } = props;

  if (!selected) return;

  const queryClient = useQueryClient();

  const refInput = useRef();

  const [avatar, setAvatar] = useState(selected.avatar);
  const [file, setFile] = useState();

  useEffect(() => {
    refInput.current.focus();
    refInput.current.value = selected.title;
  }, []);

  const updateConversation = async () => {
    if (refInput.current.value === null || refInput.current.value === "")
      return;

    let url = "";
    if (file === undefined) {
      url = avatar;
    } else {
      // Create a root reference
      const storage = getStorage();
      url = await uploadBytes(ref(storage, `avatar/${file?.name}`), file).then(
        (snapshot) => {
          return getDownloadURL(snapshot.ref).then((url) => {
            return url;
          });
        },
      );
    }

    queryClient.setQueryData(["conversation"], (oldData) => {
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
        selected: {
          ...oldData.selected,
          title: refInput.current.value,
          avatar: url,
        },
        noLoading: true,
      };
    });
    updateConversation(selected.id, refInput.current.value, url);

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
    <div className="flex flex-col gap-[3rem] p-10 pt-12">
      <div className="relative flex items-end justify-evenly">
        <ImageWithLightBoxAndNoLazy
          src={avatar ?? ""}
          className="loaded aspect-square cursor-pointer rounded-[1rem] bg-[size:150%] laptop:w-[5rem]"
        />
        <MediaPicker
          className="absolute laptop:left-[6rem] laptop:top-[-1.5rem]"
          accept="image/png, image/jpeg, image/webp"
          id="new-conversation-avatar"
          onChange={chooseAvatar}
        />
        <CustomInput
          type="text"
          reference={refInput}
          className="laptop:w-[30rem]"
          placeholder="Type group name"
        />
      </div>
      <CustomButton
        className={`!mr-0 laptop:!w-[7rem] laptop:text-base desktop:text-md`}
        padding="py-[.3rem]"
        gradientWidth="110%"
        gradientHeight="120%"
        rounded="3rem"
        title="Save"
        onClick={updateConversation}
      />
    </div>
  );
};

export default UpdateConversation;
