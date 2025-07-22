import { createFileRoute, redirect } from "@tanstack/react-router";
import userQueryOptions from "../../features/authentication/queries/userInfoQuery";
import { AuthenticationContainer } from "../../pages/Authentication";

export const Route = createFileRoute("/auth/")({
  component: AuthenticationContainer,
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(userQueryOptions);
    } catch (err) {
      // Gọi API thất bại → mở trang auth
      return null;
    }
    // Nếu có userinfo -> redirect về home
    return redirect({ to: "/" });
  },
});
