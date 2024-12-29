import { useContext } from "react";
import { LoadingContext } from "../context/loadingContext";

const useLoading = () => useContext(LoadingContext);
export default useLoading;
