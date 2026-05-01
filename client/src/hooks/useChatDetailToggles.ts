import { useContext } from "react";
import { ChatDetailTogglesContext } from "../context/ChatDetailTogglesContext";
import { ChatDetailType, TogglesContextType } from "../types/base.types";

const useChatDetailToggles = (): TogglesContextType<ChatDetailType> => {
  const ctx = useContext<TogglesContextType<ChatDetailType> | undefined>(ChatDetailTogglesContext);
  if (!ctx) throw new Error("useChatDetailToggles must be used inside ChatDetailTogglesProvider");
  return ctx;
};

export default useChatDetailToggles;
