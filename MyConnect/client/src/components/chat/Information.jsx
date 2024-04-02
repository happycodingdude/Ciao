import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef } from "react";
import { HttpRequest } from "../../common/Utility";
import {
  useAuth,
  useDeleteChat,
  useFetchAttachments,
  useFetchConversations,
  useFetchFriends,
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
  console.log("Information calling");
  const { refAttachment, refInformationExposed } = props;

  const auth = useAuth();
  const { selected, setSelected, setConversations } = useFetchConversations();
  const { participants } = useFetchParticipants();
  const { displayAttachments } = useFetchAttachments();
  const { deleteChat } = useDeleteChat();
  const { removeConversation } = useFetchConversations();
  const { profile } = useFetchFriends();

  useEffect(() => {
    refInformationExposed.showInformation = () => {
      refInformation.current.classList.remove(
        "animate-flip-scale-down-vertical",
      );
      refInformation.current.classList.add("animate-flip-scale-up-vertical");
    };
  }, []);

  const refInformation = useRef();

  const reset = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.remove("animate-flip-scale-down-vertical");
  };

  useEffect(() => {
    reset();
  }, [selected.Id]);

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
    const body = [
      {
        op: "replace",
        path: "Avatar",
        value: url,
      },
    ];

    HttpRequest({
      method: "patch",
      url: `api/conversations/${selected.Id}`,
      token: auth.token,
      data: body,
    }).then((res) => {
      setSelected((current) => ({ ...current, Avatar: url }));
      setConversations((current) => {
        return current.map((item) => {
          if (item.Id === selected.Id) item.Avatar = url;
          return item;
        });
      });
    });

    e.target.value = null;
  };

  const hideInformation = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.add("animate-flip-scale-down-vertical");
  };

  const showAllAttachment = () => {
    hideInformation();
    refAttachment.showAttachment();
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
            {/* <ImageWithLightBoxWithBorderAndShadow
              src={selected.Avatar ?? ""}
              className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
              onClick={() => {}}
            /> */}
            {selected.IsGroup ? (
              <>
                <ImageWithLightBoxWithBorderAndShadow
                  src={selected.Avatar ?? ""}
                  className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                  onClick={() => {}}
                />
                <MediaPicker
                  className="absolute left-[42%] top-[-10%]"
                  accept="image/png, image/jpeg"
                  id="conversation-avatar"
                  onChange={updateAvatar}
                />
                <CustomLabel
                  className="font-bold laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={selected.Title}
                  tooltip
                />
                <div className="cursor-pointer text-[var(--text-main-color-blur)]">
                  {participants?.length} members
                </div>
              </>
            ) : (
              <>
                <ImageWithLightBoxWithBorderAndShadow
                  src={profile?.Avatar ?? ""}
                  className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                  slides={[
                    {
                      src: profile?.Avatar ?? "",
                    },
                  ]}
                />
                <CustomLabel
                  className="font-bold laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={profile?.Name}
                />
              </>
            )}
          </div>
          <div className="flex w-full justify-center gap-[2rem]">
            {selected.IsGroup ? (
              <>
                <ToggleNotification />
                <AddParticipants />
              </>
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
                      : "images/filenotfound.svg",
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
            deleteChat(participants).then(() => {
              removeConversation(selected.Id);
              setSelected(undefined);
            });
          }}
        />
      </div>
    </div>
  );
};

export default Information;
