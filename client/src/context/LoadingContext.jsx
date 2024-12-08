import React, { createContext, useContext, useState } from "react";

// Create the context
const LoadingContext = createContext();

// Custom hook to use the LoadingContext
export const useLoading = () => useContext(LoadingContext);

// Provider component
export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
