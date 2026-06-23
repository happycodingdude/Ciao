import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateSettings } from "../services/auth.service";
import { ContactSettings, UserProfile } from "../types/base.types";
import useInfo from "./useInfo";

// Mặc định khớp default-value của ContactSettings phía BE (tất cả "bật").
export const DEFAULT_SETTINGS: ContactSettings = {
  showOnlineStatus: true,
  showLastSeen: true,
  pushEnabled: true,
  notifyOnMessage: true,
  notifyOnFriendRequest: true,
  notifyOnReaction: true,
  soundEnabled: true,
};

// Settings được hydrate 1 lần qua useInfo (GetInfo trả kèm). Toggle = optimistic update
// cache ["info"] rồi PUT; lỗi → rollback + toast.
const useSettings = () => {
  const { data: info } = useInfo();
  const queryClient = useQueryClient();

  const settings = info?.settings ?? DEFAULT_SETTINGS;

  const mutation = useMutation({
    mutationFn: (next: ContactSettings) => updateSettings(next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["info"] });
      const prev = queryClient.getQueryData<UserProfile>(["info"]);
      queryClient.setQueryData<UserProfile>(["info"], (old) =>
        old ? { ...old, settings: next } : old,
      );
      return { prev };
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["info"], ctx.prev);
      toast.error("👨‍✈️ Could not save settings");
    },
  });

  // Patch từng phần để callsite chỉ truyền field thay đổi.
  const update = (patch: Partial<ContactSettings>) =>
    mutation.mutate({ ...settings, ...patch });

  return { settings, update, isSaving: mutation.isPending };
};

export default useSettings;
