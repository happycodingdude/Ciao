import { useQuery } from "@tanstack/react-query";
import getConversations from "../services/getConversations";

const useConversation = (page) => {
  // const axios = useAxiosRetry();
  return useQuery({
    queryKey: ["conversation"],
    queryFn: () => getConversations(page),
    staleTime: Infinity,
    // enabled: false,
    // refetchOnWindowFocus: false,
  });
};
export default useConversation;
