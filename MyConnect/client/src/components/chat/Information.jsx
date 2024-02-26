import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useDeleteChat,
  useFetchAttachments,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import DeleteConfirmation from "../common/DeleteConfirmation";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import MediaPicker from "../common/MediaPicker";
import AddParticipants from "./AddParticipants";
import ToggleNotification from "./ToggleNotification";

const Information = (props) => {
  const {
    conversation,
    // participants,
    refAttachment,
    setConversation,
    removeInListChat,
  } = props;
  if (!conversation) return;

  console.log("Information calling");
  // const [participants, setParticipants] = useState();

  const auth = useAuth();
  const { participants } = useFetchParticipants();
  const { attachments, displayAttachments, reFetch } = useFetchAttachments();
  const { deleteChat } = useDeleteChat();

  useEffect(() => {
    refInformation.showInformation = () => {
      refInformation.current.classList.remove(
        "animate-flip-scale-down-vertical",
      );
      refInformation.current.classList.add("animate-flip-scale-up-vertical");
    };

    // refInformation.setParticipants = (data) => {
    //   setParticipants(data);
    // };
  }, []);

  const refInformation = useRef();

  const reset = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.remove("animate-flip-scale-down-vertical");
  };

  useEffect(() => {
    const controller = new AbortController();
    reFetch(conversation.Id, controller);
    reset();
    return () => {
      controller.abort();
    };
  }, [conversation.Id]);

  const updateAvatar = async (e) => {
    // Create a root reference
    const storage = getStorage();
    const file = e.target.files[0];
    const url = await uploadBytes(
      ref(storage, `avatar/${file.name}`),
      file,
    ).then((snapshot) => {
      return getDownloadURL(snapshot.ref).then((url) => {
        return url;
      });
    });
    conversation.Avatar = url;

    HttpRequest({
      method: "put",
      url: `api/conversations/${conversation.Id}/avatars`,
      token: auth.token,
      data: {
        Avatar: url,
      },
    }).then((res) => {
      if (!res) return;
      setConversation({ ...conversation });
    });

    e.target.value = null;
  };

  const hideInformation = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.add("animate-flip-scale-down-vertical");
  };

  const showAllAttachment = () => {
    hideInformation();
    refAttachment.showAttachment(attachments);
  };

  return (
    <div
      ref={refInformation}
      className="relative z-10 flex h-full flex-col bg-[var(--bg-color)]"
    >
      <div
        className="flex h-[7rem] shrink-0 items-center justify-between border-b-[.1rem] border-b-[var(--border-color)] 
        px-[2rem] py-[.5rem]"
      >
        <p className="font-bold">Information</p>
      </div>
      <div
        className="hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth 
      [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-[var(--border-color)] [&>*]:p-[1rem]"
      >
        <div className="flex flex-col gap-[1rem]">
          <div className="relative flex flex-col items-center gap-[.5rem]">
            <ImageWithLightBoxWithBorderAndShadow
              src={conversation.Avatar ?? ""}
              className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
              onClick={() => {}}
            />
            {conversation.IsGroup ? (
              <>
                <MediaPicker
                  className="absolute left-[42%] top-[-10%]"
                  accept="image/png, image/jpeg"
                  id="customer-avatar"
                  onChange={updateAvatar}
                />
                <CustomLabel
                  className="font-bold laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={conversation.Title}
                  tooltip
                />
                <div className="cursor-pointer text-[var(--text-main-color-blur)]">
                  {participants?.length} members
                </div>
              </>
            ) : (
              <CustomLabel
                className="font-bold laptop:max-w-[50%] desktop:max-w-[70%]"
                title={
                  participants?.find((item) => item.ContactId !== auth.user.Id)
                    ?.Contact.Name
                }
              />
            )}
          </div>
          <div className="flex w-full justify-center gap-[2rem]">
            <ToggleNotification participants={participants} />
            {conversation.IsGroup ? (
              <AddParticipants
                participants={participants}
                conversation={conversation}
              />
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[1rem]">
          <div className="flex justify-between">
            <label className="font-bold">Attachments</label>
            {displayAttachments?.length !== 0 ? (
              <div
                onClick={showAllAttachment}
                className="cursor-pointer text-[var(--main-color)] hover:text-[var(--main-color-bold)]"
              >
                See all
              </div>
            ) : (
              ""
            )}
          </div>
          <div className="grid w-full grid-cols-[repeat(4,1fr)] gap-[1rem]">
            {displayAttachments?.map((item, index) => (
              <ImageWithLightBox
                src={item.MediaUrl}
                title={item.MediaName?.split(".")[0]}
                className="aspect-square w-full cursor-pointer rounded-2xl"
                slides={displayAttachments.map((item) => ({
                  src:
                    item.Type === "image"
                      ? item.MediaUrl
                      : "../src/assets/filenotfound.svg",
                }))}
                index={index}
              />
            ))}
          </div>
        </div>
        <DeleteConfirmation
          title="Delete chat"
          message="Are you sure want to delete this chat?"
          onSubmit={() => {
            deleteChat(conversation.Id, participants).then(
              removeInListChat(conversation.Id),
            );
          }}
        />
      </div>
    </div>
  );
};

export default Information;
