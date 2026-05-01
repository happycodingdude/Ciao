import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import SideBar from "../components/layouts/SideBar";
import LoadingProvider from "../context/LoadingContext";
import { SignalProvider } from "../context/SignalContext";
import { userQueryOptions } from "../hooks/useInfo";
import { usePresencePing } from "../hooks/usePresencePing";

export const Route = createFileRoute("/_layout")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    try {
      const user = await queryClient.ensureQueryData(userQueryOptions);

      if (!user) {
        throw redirect({ to: "/auth" });
      }
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  usePresencePing();

  return (
    <>
      <div className="text-(--text-main-color) desktop:text-md laptop:text-2xs laptop-lg:text-xs relative flex w-full">
        <SideBar />
        <div className="relative grow">
          <LoadingProvider>
            <SignalProvider>
              <Outlet />
            </SignalProvider>
          </LoadingProvider>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
