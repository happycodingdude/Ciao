import { useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../../../components/MediaPicker";
import { isPhoneScreen } from "../../../utils/getScreenSize";
import { ConversationCache } from "../../listchat/types";
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
        // selected: {
        //   ...oldData.selected,
        //   title: refInput.current.value,
        //   avatar: url,
        // },
        noLoading: true,
      };
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
    <div className="flex flex-col gap-[3rem] p-10 pt-12">
      <div className="relative flex items-end justify-evenly">
        <ImageWithLightBoxAndNoLazy
          src={avatar ?? ""}
          className="aspect-square w-[5rem] cursor-pointer rounded-[1rem]"
          local
        />
        <MediaPicker
          className="absolute left-[6rem] top-[-1.5rem]"
          accept="image/png, image/jpeg, image/webp"
          id="new-conversation-avatar"
          onChange={chooseAvatar}
        />
        <CustomInput
          type="text"
          inputRef={refInput}
          className="phone:w-[20rem] laptop:w-[30rem]"
          placeholder="Type group name"
        />
      </div>
      <CustomButton
        className={`!mr-0 phone:text-base desktop:text-md`}
        width={7}
        padding="py-[.3rem]"
        gradientWidth={`${isPhoneScreen() ? "115%" : "112%"}`}
        gradientHeight={`${isPhoneScreen() ? "130%" : "122%"}`}
        rounded="3rem"
        title="Save"
        onClick={updateConversationCTA}
      />
    </div>
  );
};

export default UpdateConversation;
