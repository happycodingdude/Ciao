import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getFriends } from "../services/friend.service";
import { FriendCache } from "../types/friend.types";

const useFriend = (): UseQueryResult<FriendCache[]> => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: () => getFriends(),
    staleTime: Infinity,
    // enabled: false,
  });
};
export default useFriend;
