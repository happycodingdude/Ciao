import { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";
import { LoadingContextType } from "../types/base.types";

const useLoading = (): LoadingContextType => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
  return ctx;
};
export default useLoading;
