import { useQuery, UseQueryResult } from "@tanstack/react-query";
import getFriends from "../services/getFriends";
import { FriendCache } from "../types";

const useFriend = (): UseQueryResult<FriendCache[]> => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: () => getFriends(),
    staleTime: Infinity,
    // enabled: false,
  });
};
export default useFriend;
