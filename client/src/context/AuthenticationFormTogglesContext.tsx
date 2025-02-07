import React, { createContext, ReactNode, useState } from "react";
import { AuthenticationFormType, TogglesContextType } from "../types";

// Create the context
export const AuthenticationFormTogglesContext = createContext<
  TogglesContextType | undefined
>(undefined);

// Create the provider
const AuthenticationFormTogglesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [toggle, setToggle] = useState<AuthenticationFormType>("signin");

  return (
    <AuthenticationFormTogglesContext.Provider value={{ toggle, setToggle }}>
      {children}
    </AuthenticationFormTogglesContext.Provider>
  );
};

export default AuthenticationFormTogglesProvider;
