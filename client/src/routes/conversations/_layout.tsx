import { createFileRoute, Outlet } from "@tanstack/react-router";
import ChatDetailTogglesProvider from "../../context/ChatDetailTogglesContext";
import ListchatFilterProvider from "../../context/ListchatFilterContext";
import LoadingProvider from "../../context/LoadingContext";
import { SignalProvider } from "../../context/SignalContext";
import ListChatContainer from "../../layouts/ListChatContainer";

export const Route = createFileRoute("/conversations/_layout")({
  component: () => {
    return (
      <LoadingProvider>
        <SignalProvider>
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
        </SignalProvider>
      </LoadingProvider>
    );
  },
  loader: async ({ context: { queryClient } }) => {
    console.log("Fetching conversations");
    localStorage.removeItem("conversationId");
    // const conversationId = localStorage.getItem("conversationId");

    // const data = queryClient.getQueryData<ConversationCache>(
    //   conversationQueryOption(1).queryKey,
    // );
    // const selected = data?.selected;

    // if (conversationId) {
    //   // 👇 Redirect về hội thoại đang chọn
    //   throw redirect({
    //     to: `/conversations/${conversationId}`,
    //   });
    // }
  },
});
