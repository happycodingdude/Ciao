import { useQuery } from "@tanstack/react-query";

const useFriend = () => {
  return useQuery({
    queryKey: ["friend"],
    queryFn: () => getFriends(),
    staleTime: Infinity,
    enabled: false,
  });
};
export default useFriend;
