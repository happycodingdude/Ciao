import { useContext } from "react";
import { AuthenticationFormTogglesContext } from "../../../context/AuthenticationFormTogglesContext";
import { AuthenticationFormType, TogglesContextType } from "../../../types";

const useAuthenticationFormToggles = () => {
  return useContext<TogglesContextType<AuthenticationFormType>>(
    AuthenticationFormTogglesContext,
  );
};

export default useAuthenticationFormToggles;
