import { useQuery } from "@tanstack/react-query";
import getInfo from "../services/getInfo";

const useInfo = (enabled = false) => {
  return useQuery({
    queryKey: ["info"],
    queryFn: getInfo,
    staleTime: Infinity,
    enabled: enabled,
    // enabled: false,
  });
};
export default useInfo;
