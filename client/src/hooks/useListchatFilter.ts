import { useContext } from "react";
import { ListchatFilterContext } from "../context/ListchatFilterContext";

const useListchatFilter = () => useContext(ListchatFilterContext);
export default useListchatFilter;
