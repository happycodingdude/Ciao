import { useQuery } from "@tanstack/react-query";
import getInfo from "../services/getInfo";

const useInfo = (enabled = false, axios = undefined) => {
  return useQuery({
    queryKey: ["info"],
    queryFn: () => getInfo(axios),
    staleTime: Infinity,
    enabled: enabled,
    // enabled: false,
  });
};
export default useInfo;
