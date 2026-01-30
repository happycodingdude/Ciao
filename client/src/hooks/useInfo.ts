import { queryOptions, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { getInfo } from "../services/auth.service";
import { UserProfile } from "../types/base.types";

export const userQueryOptions = queryOptions({
  queryKey: ["info"],
  queryFn: getInfo,
});

const useInfo = (): UseQueryResult<UserProfile> => {
  const hasToken = !!localStorage.getItem("accessToken");

  const query = useQuery(userQueryOptions);

  useEffect(() => {
    if (hasToken && !query.data && !query.isFetching) {
      query.refetch();
    }
  }, [hasToken]);

  return query;
};

export default useInfo;
