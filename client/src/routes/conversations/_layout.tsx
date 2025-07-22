import { createFileRoute, Outlet } from "@tanstack/react-router";
import ChatDetailTogglesProvider from "../../context/ChatDetailTogglesContext";
import ListchatFilterProvider from "../../context/ListchatFilterContext";
import ListChatContainer from "../../layouts/ListChatContainer";

export const Route = createFileRoute("/conversations/_layout")({
  component: () => {
    return (
      <section className={`relative flex grow overflow-hidden`}>
        <ChatDetailTogglesProvider>
          <ListchatFilterProvider>
            <ListChatContainer />
          </ListchatFilterProvider>
          <div className="relative h-screen w-full">
            <Outlet />
          </div>
        </ChatDetailTogglesProvider>
      </section>
    );
  },
  // loader: async ({ context: { queryClient } }) =>
  //   queryClient.ensureQueryData(conversationQueryOption),
});
