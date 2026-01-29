import { useQuery, UseQueryResult } from "@tanstack/react-query";
import getNotifications from "../features/notification/services/getNotifications";
import { NotificationModel } from "../types";

const useNotification = (): UseQueryResult<NotificationModel[]> => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: getNotifications,
    staleTime: Infinity,
    // enabled: false,
  });
};
export default useNotification;
