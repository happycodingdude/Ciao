import React, { createContext, useState } from "react";
import Loading from "../components/common/Loading";

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  console.log("LoadingProvider calling");

  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <Loading />
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
