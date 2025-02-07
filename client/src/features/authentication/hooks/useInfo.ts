import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { UserProfile } from "../../../types";
import getInfo from "../services/getInfo";

const useInfo = (enabled: boolean = false): UseQueryResult<UserProfile> => {
  const hasToken = !!localStorage.getItem("accessToken")?.length;
  return useQuery({
    queryKey: ["info"],
    queryFn: getInfo,
    staleTime: Infinity,
    enabled: hasToken && enabled,
  });
};
export default useInfo;
