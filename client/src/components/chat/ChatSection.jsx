import React from "react";
import ChatboxContainer from "./ChatboxContainer";
import ListChatContainer from "./ListChatContainer";

export const ChatSection = (props) => {
  console.log("ChatSection calling");
  const { refListChat } = props;

  // const refInformationContainer = useRef();

  // const removeInListChat = (id) => {
  //   refListChat.removeChat(id);
  // };

  // const showInformationContainer = () => {
  //   refInformationContainer.current.classList.remove(
  //     "animate-information-hide",
  //   );
  //   refInformationContainer.current.classList.add("animate-information-show");
  // };

  // const hideInformationContainer = () => {
  //   refInformationContainer.current.classList.remove(
  //     "animate-information-show",
  //   );
  //   refInformationContainer.current.classList.add("animate-information-hide");
  // };

  // const toggleInformationContainer = () => {
  //   if (
  //     refInformationContainer.current.classList.contains(
  //       "animate-information-hide",
  //     )
  //   )
  //     showInformationContainer();
  //   else hideInformationContainer();
  // };

  return (
    <section className={`flex grow overflow-hidden`}>
      <ListChatContainer />
      <ChatboxContainer />
    </section>
  );
};
