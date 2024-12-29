import { useQuery } from "@tanstack/react-query";
import getInfo from "../services/getInfo";

const useInfo = (signedOut) => {
  return useQuery({
    queryKey: ["info"],
    queryFn: getInfo,
    staleTime: Infinity,
    enabled: !signedOut,
  });
};
export default useInfo;
