import { useContext } from "react";
import { ListchatFilterContext } from "../../../context/listchatFilterContext";

const useListchatFilter = () => useContext(ListchatFilterContext);
export default useListchatFilter;
