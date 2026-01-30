import { createContext, ReactNode, useState } from "react";
import { LoadingContextType } from "../types/base.types";

// Create the context
export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined,
);

// Provider component
const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
