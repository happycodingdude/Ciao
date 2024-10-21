import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImageOLD, HttpRequest } from "../../common/Utility";
import { useAuth, useFetchConversations } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ImageWithLightBox from "../common/ImageWithLightBox";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const ListFriend = (props) => {
  const refProfileWrapper = useRef();
  const { onClose } = props;
  const auth = useAuth();
  const {
    checkExist,
    reFetch: reFetchConversations,
    setSelected,
  } = useFetchConversations();

  // const [name, setName] = useState("");
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    blurImageOLD(".list-friend-container");
  }, [contacts]);

  function fetchDropdownOptions(key) {
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYNAME.replace(
        "{name}",
        key,
      ),
      token: auth.token,
    }).then((res) => {
      setContacts(res.data);
    });
  }

  const debounceDropDown = useCallback(
    debounce((nextValue) => fetchDropdownOptions(nextValue), 100),
    [],
  );

  const findContact = (name) => {
    // setName(name);
    debounceDropDown(name);
  };

  const chat = (contactId) => {
    const chat = checkExist(contactId);
    if (chat !== undefined) {
      setConversationAndClose(chat);
      return;
    }

    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GET,
      token: auth.token,
    }).then((res) => {
      // let participantArr = [];
      // res.data
      //   .filter((item) => !item.IsGroup)
      //   .map(
      //     (item) =>
      //       (participantArr = [...participantArr, ...item.Participants]),
      //   );
      const selectedConversation = res.data
        .filter((item) => !item.isGroup)
        .filter((item) =>
          item.participants.some((item) => item.contactId === auth.id),
        )
        .find((item) =>
          item.participants.some((item) => item.contactId === contactId),
        );
      console.log(selectedConversation);
      // Tìm hội thoại đã có trước đó nhưng đã delete
      // Bật lại hội thoại
      if (selectedConversation) {
        const selectedParticipant = selectedConversation.participants.find(
          (item) => item.contactId === auth.id,
        );
        const body = [
          {
            op: "replace",
            path: "isDeleted",
            value: false,
          },
        ];
        return HttpRequest({
          method: "patch",
          url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GETBYID.replace(
            "{id}",
            selectedParticipant.id,
          ),
          token: auth.token,
          data: body,
        }).then((res) => {
          reFetchConversations();
          setConversationAndClose(selectedConversation);
        });
        // Ko tồn tại hội thoại giữa 2 contact thì tạo mới
      } else {
        const body = {
          participants: [
            {
              contactId: auth.id,
              isNotifying: true,
              isModerator: true,
            },
            {
              contactId: contactId,
              isNotifying: true,
              isDeleted: true,
            },
          ],
        };
        HttpRequest({
          method: "post",
          url: import.meta.env.VITE_ENDPOINT_CONVERSATION_INCLUDENOTIFY,
          token: auth.token,
          data: body,
        }).then((res) => {
          reFetchConversations();
          setConversationAndClose(res.data);
        });
      }
    });
  };

  const setConversationAndClose = (conversation) => {
    setSelected(conversation);
    onClose();
  };

  return (
    <div
      ref={refProfileWrapper}
      className="flex flex-col p-10 pt-12 text-[90%] laptop:h-[45rem] desktop:h-[80rem]"
    >
      <CustomInput
        // className="bg-[var(--bg-color-extrathin)]"
        type="text"
        label="Search for name"
        // value={name}
        onChange={(e) => {
          findContact(e.target.value);
        }}
      />
      <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col overflow-y-scroll scroll-smooth text-[var(--text-main-color)]">
        {contacts.map((item, i) => (
          <div
            data-key={item.id}
            className="flex cursor-pointer items-center gap-4 rounded-2xl px-2 py-3 hover:bg-[var(--bg-color-thin)]"
          >
            <ImageWithLightBox
              src={item.avatar}
              // className={`pointer-events-none aspect-square w-[5rem] rounded-2xl shadow-[0px_0px_10px_-7px_var(--shadow-color)]`}
              className="aspect-square cursor-pointer rounded-2xl laptop:w-[5rem]"
              spinnerClassName="laptop:bg-[size:2rem]"
              imageClassName="bg-[size:150%]"
            />
            <div className="flex h-full flex-col items-start">
              <p className="font-medium">{item.name}</p>
              <p className="text-[var(--text-main-color-normal)]">{item.Bio}</p>
            </div>
            {
              {
                new: (
                  <AddButton
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
                    id={item.id}
                    onClose={(friend) => {
                      setContacts((current) => {
                        return current.map((contact) => {
                          if (contact.id !== item.id) return contact;
                          contact.friendId = friend.id;
                          contact.friendStatus = "request_sent";
                          return contact;
                        });
                      });
                    }}
                  />
                ),
                request_received: (
                  <AcceptButton
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
                    id={item.friendId}
                    onClose={() => {
                      setContacts((current) => {
                        return current.map((contact) => {
                          if (contact.id !== item.id) return contact;
                          contact.friendId = null;
                          contact.friendStatus = "friend";
                          return contact;
                        });
                      });
                    }}
                  />
                ),
                request_sent: (
                  <CancelButton
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
                    id={item.friendId}
                    onClose={() => {
                      setContacts((current) => {
                        return current.map((contact) => {
                          if (contact.id !== item.id) return contact;
                          contact.friendId = null;
                          contact.friendStatus = "new";
                          return contact;
                        });
                      });
                    }}
                  />
                ),
                friend: (
                  <CustomButton
                    title="Chat"
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-xs desktop:h-[4rem] desktop:text-md"
                    onClick={() => {
                      chat(item.id);
                    }}
                  />
                ),
              }[item.friendStatus]
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListFriend;
