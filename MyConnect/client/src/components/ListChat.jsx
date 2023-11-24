import React, { useEffect, useRef } from "react";

const ListChat = ({ chats, setConversation }) => {
  const refChatItem = useRef([]);
  const refChats = useRef();

  const focusFirstChat = (item) => {
    refChatItem.current.map((ref) => {
      if (ref.dataset.key === item.Id) {
        ref.classList.add("item-active");
      } else {
        ref.classList.remove("item-active");
      }
    });
  };

  const handleSetConversation = (item) => {
    setConversation(item);
    focusFirstChat(item);
  };

  useEffect(() => {
    refChatItem.current = refChatItem.current.filter((item) => item !== null);
    focusFirstChat(chats[0]);
  }, chats);

  const scrollListChatToBottom = () => {
    refChats.current.scrollTop = refChats.current.scrollHeight;
  };

  return (
    <div
      div
      className="m-[1rem] flex w-[clamp(30rem,20vw,40rem)] shrink-0 flex-col [&>*]:m-[1rem]"
    >
      <input
        type="text"
        placeholder="Search"
        className="rounded-[.5rem] p-[1rem] focus:outline-none"
      ></input>
      <div className="flex flex-col overflow-hidden border-b-[.1rem]">
        <div className="flex h-[clamp(5rem,10vh,7rem)] items-center justify-between">
          <label className="text-gray-400">Friends</label>
          <a href="#" className="fa fa-arrow-up text-gray-500"></a>
        </div>
        <div
          ref={refChats}
          className="hide-scrollbar flex h-[clamp(30rem,50vh,50rem)] flex-col gap-[2rem] overflow-y-scroll scroll-smooth"
        >
          {chats.map((item, i) => (
            <div
              data-key={item.Id}
              ref={(element) => {
                refChatItem.current[i] = element;
              }}
              className="group flex cursor-pointer rounded-[1rem] p-[1rem] 
                                hover:bg-blue-500 hover:text-white"
              onClick={() => {
                handleSetConversation(item);
              }}
            >
              <div className="flex grow items-start gap-[1rem]">
                <div className="aspect-square w-[4rem] rounded-[50%] bg-orange-400"></div>
                <div className="grow">
                  <p className="font-bold">{item.Title}</p>
                  <p className="">{item.LastMessage}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-[.5rem]">
                <p className="font-thin text-gray-950 group-hover:text-white group-[.item-active]:text-white">
                  yesterday
                </p>
                <p
                  className="flex aspect-square w-[3rem] items-center justify-center rounded-[50%] bg-blue-500 text-center text-[clamp(1.2rem,1.3vw,1.4rem)]
                                        font-bold text-white
                                        group-hover:bg-white group-hover:text-blue-500
                                        group-[.item-active]:bg-white group-[.item-active]:text-blue-500"
                >
                  {item.UnSeenMessages > 5 ? "5+" : item.UnSeenMessages}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex items-center text-center text-gray-400
                                    before:mr-[2rem] before:h-[.1rem] before:grow before:bg-gray-400
                                    after:ml-[2rem] after:h-[.1rem]  after:grow after:bg-gray-400"
        >
          <div
            // ref={refScrollButton}
            className="fa fa-arrow-down  flex aspect-square w-[3rem] cursor-pointer items-center justify-center
                        rounded-[50%] bg-gray-300 font-normal text-gray-500"
            onClick={scrollListChatToBottom}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ListChat;
