import { QueryClient } from "@tanstack/react-query";
import HttpRequest from "../../../lib/fetch";
import { AppRouter } from "../../../main";

const signout = (queryClient: QueryClient, router: AppRouter) => {
  HttpRequest({
    method: "get",
    url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
  }).then((res) => {
    // queryClient.removeQueries({ queryKey: ["conversation"], exact: true });
    // queryClient.removeQueries({ queryKey: ["message"], exact: true });
    // queryClient.removeQueries({ queryKey: ["attachment"], exact: true });
    // queryClient.removeQueries({ queryKey: ["friend"], exact: true });
    // queryClient.removeQueries({ queryKey: ["notification"], exact: true });
    // queryClient.removeQueries({ queryKey: ["info"], exact: true });

    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("refreshToken");
    // localStorage.removeItem("userId");
    // localStorage.removeItem("isRegistered");
    // localStorage.removeItem("toggleChatDetail");

    // Xóa toàn bộ cache liên quan
    const keysToRemove = [
      "conversation",
      "message",
      "attachment",
      "friend",
      "notification",
      "info",
    ];

    keysToRemove.forEach((key) => {
      queryClient.removeQueries({ queryKey: [key], exact: true });
    });

    // Ghi đè user info thành null
    queryClient.setQueryData(["info"], null);

    // Xóa localStorage
    [
      "accessToken",
      "refreshToken",
      "userId",
      "isRegistered",
      "toggleChatDetail",
    ].forEach((key) => localStorage.removeItem(key));

    setTimeout(() => {
      router.navigate({ to: "/auth" });
    }, 500);
  });
};

export default signout;
