import { useContext } from "react";
import {
  ChatDetailTogglesContext,
  ChatDetailTogglesContextValue,
} from "../context/ChatDetailTogglesContext";

const useChatDetailToggles = (): ChatDetailTogglesContextValue => {
  const ctx = useContext(ChatDetailTogglesContext);
  if (!ctx) throw new Error("useChatDetailToggles must be used inside ChatDetailTogglesProvider");
  return ctx;
};

export default useChatDetailToggles;
