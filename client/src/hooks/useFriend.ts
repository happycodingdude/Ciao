import { useQuery, UseQueryResult } from "@tanstack/react-query";
import getFriends from "../features/friend/services/getFriends";
import { FriendCache } from "../features/friend/types";

const useFriend = (): UseQueryResult<FriendCache[]> => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: () => getFriends(),
    staleTime: Infinity,
    // enabled: false,
  });
};
export default useFriend;
