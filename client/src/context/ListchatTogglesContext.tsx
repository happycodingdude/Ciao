import { createContext, ReactNode, useState } from "react";
import { BooleanContextType } from "../types/base.types";

// Create the context
export const ListchatTogglesContext = createContext<
  BooleanContextType | undefined
>(undefined);

// Create the provider
const ListchatTogglesProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<boolean>(false);

  return (
    <ListchatTogglesContext.Provider value={{ value, setValue }}>
      {children}
    </ListchatTogglesContext.Provider>
  );
};

export default ListchatTogglesProvider;
