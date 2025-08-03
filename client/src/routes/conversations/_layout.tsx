import { Await, createFileRoute, defer, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import LocalLoading from "../../components/LocalLoading";
import ChatDetailTogglesProvider from "../../context/ChatDetailTogglesContext";
import ListchatFilterProvider from "../../context/ListchatFilterContext";
import LoadingProvider from "../../context/LoadingContext";
import { SignalProvider } from "../../context/SignalContext";
import ListChatHeaderContainer from "../../features/listchat/components/ListChatHeaderContainer";
import conversationQueryOption from "../../features/listchat/queries/conversationQuery";
import ListChatContainer from "../../layouts/ListChatContainer";

export const Route = createFileRoute("/conversations/_layout")({
  loader: ({ context: { queryClient } }) => {
    console.log("Fetching conversations");
    localStorage.removeItem("conversationId");
    const conversationPromise = defer(
      queryClient.ensureQueryData(conversationQueryOption(1)),
    );
    return { conversationPromise };
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
  component: () => {
    const { conversationPromise } = Route.useLoaderData();
    return (
      <LoadingProvider>
        <SignalProvider>
          <section className={`relative flex grow overflow-hidden`}>
            <ChatDetailTogglesProvider>
              <ListchatFilterProvider>
                <div
                  id="chat-list-v2"
                  className="flex h-screen w-[30rem] shrink-0 flex-col gap-[2rem] bg-pastel-pink"
                >
                  <ListChatHeaderContainer />
                  <div className="relative grow">
                    <Suspense fallback={<LocalLoading />}>
                      <Await promise={conversationPromise}>
                        {(data) => <ListChatContainer />}
                        {/* {(data) => <LocalLoading />} */}
                      </Await>
                    </Suspense>
                  </div>
                </div>
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
});
