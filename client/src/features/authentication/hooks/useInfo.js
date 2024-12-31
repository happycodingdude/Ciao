import { useQuery } from "@tanstack/react-query";
import getInfo from "../services/getInfo";

const useInfo = (enabled = false) => {
  // debugger;
  if (!localStorage.getItem("accessToken")?.length) return { data: undefined };
  // const axios = useAxiosRetry();
  return useQuery({
    queryKey: ["info"],
    queryFn: () => getInfo(),
    staleTime: Infinity,
    enabled: enabled,
  });
};
export default useInfo;
