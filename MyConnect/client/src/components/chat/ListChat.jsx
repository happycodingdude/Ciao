import moment from "moment";
import React, { useEffect, useRef } from "react";
import {
  useAuth,
  useFetchAttachments,
  useFetchConversations,
  useFetchFriends,
  useFetchMessages,
  useFetchParticipants,
} from "../../hook/CustomHooks";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBox from "../common/ImageWithLightBox";
import AddFriend from "../friend/AddFriend";
import CreateGroupChat from "./CreateGroupChat";

const ListChat = (props) => {
  console.log("ListChat calling");
  const { refListChat } = props;

  const auth = useAuth();
  const {
    conversations,
    selected,
    setSelected,
    reFetch: reFetchConversations,
    newMessage,
    clickConversation,
  } = useFetchConversations();
  const { reFetch: reFetchParticipants } = useFetchParticipants();
  const { reFetch: reFetchMessages } = useFetchMessages();
  const { reFetch: reFetchAttachments } = useFetchAttachments();
  const { reFetchProfile, reFetchRequest } = useFetchFriends();

  const refChatItem = useRef([]);
  const refChats = useRef();
  const refChatsScroll = useRef();

  const handleSetConversation = (position, item) => {
    setSelected(item);
  };

  useEffect(() => {
    if (selected === undefined) return;
    reFetchMessages(selected.id);
    reFetchParticipants(selected.id);
    reFetchAttachments(selected.id);
    clickConversation(selected);
    // refChats.current.scrollTop = position;
    if (!selected.isGroup) {
      reFetchProfile(
        selected.participants.find((item) => item.contactId !== auth.id)
          .contactId,
      );
      // reFetchRequest(
      //   selected.participants.find((item) => item.contactId !== auth.id)
      //     .contactId,
      // );
    }
  }, [selected?.id]);

  // Get all chats when first time render
  useEffect(() => {
    if (!auth.valid) return;

    // const controller = new AbortController();
    reFetchConversations();

    // listenNotification((message) => {
    //   console.log("Home receive message from worker");
    //   const messageData = JSON.parse(message.data);
    //   switch (message.event) {
    //     case "AddMember":
    //       console.log(messageData);
    //       break;
    //     default:
    //       break;
    //   }
    // });
    // return () => {
    //   controller.abort();
    // };
  }, [auth.valid]);

  useEffect(() => {
    refChatItem.current = refChatItem.current.filter((item) => item !== null);

    if (refChats.current.scrollHeight <= refChats.current.clientHeight)
      refChatsScroll.current.classList.add("hidden");
    else refChatsScroll.current.classList.remove("hidden");

    refListChat.newMessage = newMessage;

    // listenNotification((message) => {
    //   console.log("ListChat receive message from worker");
    //   const messageData = JSON.parse(message.data);
    //   switch (message.event) {
    //     case "NewMessage":
    //       if (!chats.some((item) => item.LastMessageId === messageData.Id))
    //         notifyMessage(chats, messageData);
    //       break;
    //     default:
    //       break;
    //   }
    // });

    moment.locale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s",
        s: "1m",
        ss: "1m",
        m: "%dm",
        mm: "%dm",
        h: "%dh",
        hh: "%dh",
        d: "a day",
        dd: "%dd",
        M: "a month",
        MM: "%dM",
        y: "a year",
        yy: "%dY",
      },
    });
  }, [conversations]);

  const scrollListChatToBottom = () => {
    refChats.current.scrollTop = refChats.current.scrollHeight;
  };

  return (
    <div className="flex w-[calc(100%/4)] min-w-[calc(100%/4)] flex-col bg-[var(--bg-color)] shadow-[5px_0px_10px_-10px_var(--shadow-color)_inset]">
      <div className="flex h-[7rem] shrink-0 items-center gap-[1rem] border-b-[.1rem] border-b-[var(--border-color)] px-[2rem]">
        <div className="flex h-[50%] grow">
          <i
            className="fa fa-search flex w-[3rem] shrink-0 items-center justify-center rounded-l-lg bg-[var(--search-bg-color)] pl-[1rem] 
          font-normal text-[var(--icon-text-color)]"
          ></i>
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-r-[.5rem] bg-[var(--search-bg-color)] p-[1rem] focus:outline-none"
          ></input>
        </div>
        <div className="flex h-[50%] gap-[.5rem] [&>*]:px-[.5rem]">
          <AddFriend />
          <CreateGroupChat />
        </div>
      </div>
      <div
        ref={refChats}
        className="hide-scrollbar flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth p-[1rem] desktop:h-[50rem]"
      >
        {conversations?.map((item, i) => (
          <div
            data-key={item.id}
            data-user={
              !item.isGroup
                ? item.participants.find((item) => item.contactId !== auth.id)
                    ?.contactId
                : ""
            }
            ref={(element) => {
              refChatItem.current[i] = element;
            }}
            className={`chat-item group flex h-[6.5rem] shrink-0 cursor-pointer items-center gap-[1rem] overflow-hidden rounded-[1rem] 
            bg-[var(--main-color-thin)] py-[.8rem] pl-[.5rem] pr-[1rem] hover:bg-[var(--main-color-light)]
            ${
              selected?.id === item.id
                ? `item-active bg-gradient-to-r from-[var(--main-color)] to-[var(--main-color-light)] text-[var(--text-sub-color)] 
                [&_.chat-content]:text-[var(--text-sub-color-blur)]`
                : ""
            } `}
            onClick={() => {
              handleSetConversation(65 * i, item);
            }}
          >
            {item.isGroup ? (
              <ImageWithLightBox
                src={item.avatar ?? ""}
                className={`pointer-events-none aspect-square w-[5rem] rounded-2xl shadow-[0px_0px_10px_-7px_var(--shadow-color)]`}
              />
            ) : (
              <ImageWithLightBox
                src={
                  item.participants.find((item) => item.contactId !== auth.id)
                    ?.contact.avatar ?? ""
                }
                className={`pointer-events-none aspect-square w-[5rem] rounded-2xl shadow-[0px_0px_10px_-7px_var(--shadow-color)]`}
              />
            )}
            <div className={`flex h-full w-1/2 grow flex-col gap-[.3rem]`}>
              <CustomLabel
                className={`text-base ${item.lastMessageContact !== auth.id && item.unSeenMessages > 0 ? "font-bold" : ""} `}
                title={
                  item.isGroup
                    ? item.title
                    : item.participants.find(
                        (item) => item.contactId !== auth.id,
                      )?.contact.name
                }
              />
              <CustomLabel
                className={`chat-content ${
                  item.lastMessageContact !== auth.id && item.unSeenMessages > 0
                    ? "font-medium"
                    : "text-[var(--text-main-color-blur)]"
                }`}
                // title={
                //   item.lastMessage === null
                //     ? ""
                //     : GenerateContent(contacts, item.lastMessage)
                // }
                title={item.lastMessage}
              />
            </div>
            <div
              // className={`flex h-full shrink-0 flex-col items-end ${item.unSeenMessages > 0 ? "justify-evenly" : ""} laptop:min-w-[4rem]`}
              className={`flex h-full shrink-0 flex-col items-end laptop:min-w-[4rem]`}
            >
              <p>
                {item.lastMessageTime === null
                  ? ""
                  : moment(item.lastMessageTime).fromNow()}
              </p>
              {/* {item.lastMessageContact == auth.id ||
              item.unSeenMessages == 0 ? (
                ""
              ) : (
                <div
                  className="flex aspect-square w-[2.25rem] items-center justify-center rounded-full bg-[var(--main-color-normal)] 
                  text-center text-xs leading-9"
                >
                  {item.unSeenMessages > 5 ? "5+" : item.unSeenMessages}
                </div>
              )} */}
            </div>
          </div>
        ))}
      </div>
      <div
        ref={refChatsScroll}
        className="mx-auto my-[.5rem] hidden items-center text-center"
      >
        <div
          className="fa fa-arrow-down flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-full 
          bg-[var(--main-color-normal)] font-normal text-[var(--text-sub-color)] hover:bg-[var(--main-color)]"
          onClick={scrollListChatToBottom}
        ></div>
      </div>
    </div>
  );
};

export default ListChat;
