import { useQuery } from "@tanstack/react-query";
import getMessages from "../services/getMessages";

const useMessage = (conversationId, setNextExist) => {
  // const axios = useAxiosRetry();
  // return useQuery({
  //   queryKey: ["message"],
  //   queryFn: () => getMessages(conversationId, page),
  //   staleTime: Infinity,
  //   enabled: false,
  //   // refetchOnWindowFocus: false,
  // });

  return useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      // if (!conversationId) return null;
      const data = await getMessages(conversationId, 1);
      setNextExist(data.nextExist);
      return {
        pages: [
          {
            rows: data.messages,
            nextOffset: 2,
          },
        ],
      };
    },
  });
};

export default useMessage;
