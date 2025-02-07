import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { NotificationModel } from "../../../types";
import getNotifications from "../services/getNotifications";

const useNotification = (): UseQueryResult<NotificationModel[]> => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: getNotifications,
    staleTime: Infinity,
    enabled: false,
  });
};
export default useNotification;
