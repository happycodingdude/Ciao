import { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";

const useLoading = () => useContext(LoadingContext);
export default useLoading;
