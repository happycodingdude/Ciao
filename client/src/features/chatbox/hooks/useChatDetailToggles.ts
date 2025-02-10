import { useContext } from "react";
import { ChatDetailTogglesContext } from "../../../context/ChatDetailTogglesContext";
import { ChatDetailType, TogglesContextType } from "../../../types";

const useChatDetailToggles = () => {
  return useContext<TogglesContextType<ChatDetailType>>(
    ChatDetailTogglesContext,
  );
};

export default useChatDetailToggles;
