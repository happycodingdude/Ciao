import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "../hooks/useInfo";

export const Route = createFileRoute("/auth/_layout")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    try {
      const user = await queryClient.ensureQueryData(userQueryOptions);

      if (user) {
        throw redirect({ to: "/conversations" });
      }
    } catch (error) {
      if (isRedirect(error)) throw error;
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
