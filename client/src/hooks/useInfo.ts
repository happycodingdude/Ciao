import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import getInfo from "../features/authentication/services/getInfo";
import { UserProfile } from "../types";

// const useInfo = (enabled: boolean = false): UseQueryResult<UserProfile> => {
//   const hasToken = !!localStorage.getItem("accessToken")?.length;
//   return useQuery({
//     queryKey: ["info"],
//     queryFn: getInfo,
//     staleTime: Infinity,
//     enabled: hasToken || enabled,
//   });
// };

const useInfo = (): UseQueryResult<UserProfile> => {
  const hasToken = !!localStorage.getItem("accessToken");

  const query = useQuery({
    queryKey: ["info"],
    queryFn: getInfo,
    staleTime: Infinity,
    enabled: false, // Luôn để false, chủ động refetch
  });

  useEffect(() => {
    if (hasToken && !query.data && !query.isFetching) {
      query.refetch();
    }
  }, [hasToken]);

  return query;
};

export default useInfo;
