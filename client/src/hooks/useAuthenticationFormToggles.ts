import { useContext } from "react";
import { AuthenticationFormTogglesContext } from "../context/AuthenticationFormTogglesContext";
import { AuthenticationFormType, TogglesContextType } from "../types/base.types";

const useAuthenticationFormToggles = (): TogglesContextType<AuthenticationFormType> => {
  const ctx = useContext(AuthenticationFormTogglesContext);
  if (!ctx) throw new Error("useAuthenticationFormToggles must be used inside AuthenticationFormTogglesProvider");
  return ctx;
};

export default useAuthenticationFormToggles;
