import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

type TogglesContextType = {
  toggle: string;
  setToggle: Dispatch<SetStateAction<AuthenticationFormType>>;
};

type AuthenticationFormType = "signin" | "signup" | "forgot";

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
