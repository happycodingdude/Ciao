import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import SideBar from "../../components/layouts/SideBar";
import LoadingProvider from "../../context/LoadingContext";
import { SignalProvider } from "../../context/SignalContext";
import { userQueryOptions } from "../../hooks/useInfo";

export const Route = createFileRoute("/(app)/_layout")({
  beforeLoad: async ({ context }) => {
    console.log("Checking authentication in AppLayout");

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
  console.log("Rendering AppLayout");

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
      <ReactQueryDevtools buttonPosition="bottom-right" />
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
