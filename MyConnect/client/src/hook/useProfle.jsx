import { useContext } from "react";
import ProfileContext from "../context/ProfilePortal";

const useProfle = () => {
  return useContext(ProfileContext);
};

export default useProfle;
