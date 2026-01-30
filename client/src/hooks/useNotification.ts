import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.service";
import { NotificationModel } from "../types/base.types";

const useNotification = (): UseQueryResult<NotificationModel[]> => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: getNotifications,
    staleTime: Infinity,
    // enabled: false,
  });
};
export default useNotification;
