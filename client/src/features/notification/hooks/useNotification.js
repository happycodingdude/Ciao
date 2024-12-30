import { useQuery } from "@tanstack/react-query";
import getNotifications from "../services/getNotifications";

const useNotification = () => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: getNotifications,
    staleTime: Infinity,
    // enabled: false,
  });
};
export default useNotification;
