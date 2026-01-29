import { useContext } from "react";
import { ListchatTogglesContext } from "../context/ListchatTogglesContext";

const useListchatToggle = () => useContext(ListchatTogglesContext);
export default useListchatToggle;
