import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../hook/useAuth";
import CustomLabel from "../common/CustomLabel";
import DeleteConfirmation from "../common/DeleteConfirmation";
import ImageWithLightBox from "../common/ImageWithLightBox";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import MediaPicker from "../common/MediaPicker";
import AddParticipants from "./AddParticipants";
import ToggleNotification from "./ToggleNotification";

const Information = ({ reference }) => {
  console.log("Information calling");
  const auth = useAuth();

  const [participants, setParticipants] = useState();
  const [attachments, setAttachments] = useState();
  const [displayAttachments, setDisplayAttachments] = useState();

  const refInformation = useRef();

  useEffect(() => {
    if (!reference.conversation) return;

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };

    axios
      .get(`api/conversations/${reference.conversation?.Id}/attachments`, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        if (res.data.data.length !== 0) {
          setAttachments(res.data.data);
          setDisplayAttachments(res.data.data[0].Attachments.slice(0, 8));
        } else {
          setAttachments([]);
          setDisplayAttachments([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    reset();

    return () => {
      cancelToken.cancel();
    };
  }, [reference.conversation.Id]);

  const reset = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.remove("animate-flip-scale-down-vertical");
  };

  const deleteChat = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const selected = participants.find((item) => item.ContactId === auth.id);
    selected.IsDeleted = true;
    axios
      .put(
        `api/conversations/${reference.conversation?.Id}/participants`,
        selected,
        {
          cancelToken: cancelToken.token,
          headers: headers,
        },
      )
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        reference.removeInListChat(res.data.data.ConversationId);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  const updateAvatar = async (e) => {
    const file = e.target.files[0];
    // Create a root reference
    const storage = getStorage();
    const url = await uploadBytes(
      ref(storage, `avatar/${file.name}`),
      file,
    ).then((snapshot) => {
      return getDownloadURL(snapshot.ref).then((url) => {
        return url;
      });
    });
    reference.conversation.Avatar = url;

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .put(
        `api/conversations/${reference.conversation.Id}/avatars`,
        { Avatar: url },
        {
          cancelToken: cancelToken.token,
          headers: headers,
        },
      )
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        reference.setConversation({ ...reference.conversation });
      })
      .catch((err) => {
        console.log(err);
      });

    e.target.value = null;

    return () => {
      cancelToken.cancel();
    };
  };

  useEffect(() => {
    reference.refInformation.showInformation = () => {
      refInformation.current.classList.remove(
        "animate-flip-scale-down-vertical",
      );
      refInformation.current.classList.add("animate-flip-scale-up-vertical");
    };

    reference.refInformation.setParticipants = (data) => {
      setParticipants(data);
    };
  }, []);

  const hideInformation = () => {
    refInformation.current.classList.remove("animate-flip-scale-up-vertical");
    refInformation.current.classList.add("animate-flip-scale-down-vertical");
  };

  const showAllAttachment = () => {
    hideInformation();
    reference.refAttachment.showAttachment(attachments);
  };

  const showProfile = () => {
    console.log("showProfile calling");
  };

  return (
    <div
      ref={refInformation}
      className="relative z-10 flex h-full flex-col bg-white"
    >
      <div className="flex h-[7rem] shrink-0 items-center justify-between border-b-[.1rem] border-b-gray-300 px-[2rem] py-[.5rem]">
        <p className="font-bold text-gray-600">Information</p>
        {/* <div className="flex h-1/2 cursor-not-allowed items-center gap-[.3rem]">
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
          <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-500"></div>
        </div> */}
      </div>
      <div className="hide-scrollbar mt-[1rem] flex flex-col overflow-hidden overflow-y-auto scroll-smooth [&>*:not(:last-child)]:border-b-[.1rem] [&>*:not(:last-child)]:border-b-blue-100 [&>*]:p-[1rem]">
        <div className="flex flex-col gap-[1rem]">
          <div className="relative flex flex-col items-center gap-[.5rem]">
            <ImageWithLightBoxWithBorderAndShadow
              src={reference.conversation?.Avatar ?? ""}
              className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
              slides={[
                {
                  src: reference.conversation?.Avatar ?? "",
                },
              ]}
              onClick={showProfile}
            />
            {reference.conversation.IsGroup ? (
              <>
                <MediaPicker
                  className="absolute left-[42%] top-[-10%]"
                  accept="image/png, image/jpeg"
                  id="customer-avatar"
                  onChange={updateAvatar}
                />
                <CustomLabel
                  className="font-bold text-gray-600 laptop:max-w-[50%] desktop:max-w-[70%]"
                  title={reference.conversation?.Title}
                  tooltip
                />
                <div className="cursor-pointer text-gray-400">
                  {participants?.length} members
                </div>
              </>
            ) : (
              <CustomLabel
                className="font-bold text-gray-600 laptop:max-w-[50%] desktop:max-w-[70%]"
                title={
                  participants?.find((item) => item.ContactId !== auth.user.Id)
                    .Contact.Name
                }
              />
            )}
          </div>
          <div className="flex w-full justify-center gap-[2rem]">
            <ToggleNotification
              reference={{
                participants,
              }}
            />
            {reference.conversation.IsGroup ? (
              <AddParticipants
                reference={{
                  participants,
                  conversation: reference.conversation,
                }}
              />
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[1rem]">
          <div className="flex justify-between">
            <label className="font-bold text-gray-600">Attachments</label>
            {displayAttachments?.length !== 0 ? (
              <div
                onClick={showAllAttachment}
                className="cursor-pointer text-blue-500"
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
              ></ImageWithLightBox>
            ))}
          </div>
        </div>
        <DeleteConfirmation
          title="Delete chat"
          message="Are you sure want to delete this chat?"
          onSubmit={deleteChat}
        ></DeleteConfirmation>
      </div>
    </div>
  );
};

export default Information;
