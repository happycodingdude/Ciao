import { createFileRoute, redirect } from "@tanstack/react-router";
import userQueryOptions from "../../features/authentication/queries/userInfoQuery";
import { AuthenticationContainer } from "../../pages/Authentication";

export const Route = createFileRoute("/auth/_layout/")({
  component: () => (
    <div className="desktop:text-md flex h-full w-full laptop:text-xs">
      <AuthenticationContainer />
    </div>
  ),
  loader: async ({ context: { queryClient } }) => {
    const cachedUser = queryClient.getQueryData(userQueryOptions.queryKey);
    if (cachedUser === null) return; // Đã logout và đã set null → không gọi lại API nữa

    try {
      const user = await queryClient.ensureQueryData(userQueryOptions);

      // Nếu có user → redirect về "/"
      if (user) return redirect({ to: "/" });

      return; // Tiếp tục render form login nếu chưa có user
    } catch (err) {
      // Nếu lỗi do chưa login → cho phép hiển thị auth page
      return;
    }
  },
});
