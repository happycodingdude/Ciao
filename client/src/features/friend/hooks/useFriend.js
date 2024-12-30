import { useQuery } from "@tanstack/react-query";
import getFriends from "../services/getFriends";

const useFriend = () => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: () => getFriends(),
    staleTime: Infinity,
    enabled: false,
  });
};
export default useFriend;
