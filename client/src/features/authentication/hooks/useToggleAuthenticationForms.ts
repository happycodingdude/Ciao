import { useContext } from "react";
import { AuthenticationFormTogglesContext } from "../../../context/AuthenticationFormTogglesContext";

const useAuthenticationFormToggles = () => {
  return useContext(AuthenticationFormTogglesContext)
};

export default useAuthenticationFormToggles;
