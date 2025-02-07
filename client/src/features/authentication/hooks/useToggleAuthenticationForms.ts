import { useContext } from "react";
import { AuthenticationFormTogglesContext } from "../../../context/AuthenticationFormTogglesContext";
import { TogglesContextType } from "../../../types";

const useAuthenticationFormToggles = () => {
  return useContext<TogglesContextType>(AuthenticationFormTogglesContext)
};

export default useAuthenticationFormToggles;
