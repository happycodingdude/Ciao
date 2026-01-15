import { Await, createFileRoute, defer, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import ListchatLoading from "../../components/ListchatLoading";
import ChatDetailTogglesProvider from "../../context/ChatDetailTogglesContext";
import ListchatFilterProvider from "../../context/ListchatFilterContext";
import LoadingProvider from "../../context/LoadingContext";
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
        <section className={`relative flex grow overflow-hidden`}>
          <ChatDetailTogglesProvider>
            <ListchatFilterProvider>
              <div className="border-r-(--border-color) flex h-screen w-80 shrink-0 flex-col gap-4 border-r-[.1rem]">
                <ListChatHeaderContainer />
                <Suspense fallback={<ListchatLoading />}>
                  <Await promise={conversationPromise}>
                    {(data) => (
                      <div className="custom-scrollbar relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-scroll scroll-smooth p-2">
                        <ListChatContainer />
                      </div>
                    )}
                  </Await>
                </Suspense>
              </div>
            </ListchatFilterProvider>
            <div className="relative h-screen grow">
              <Outlet />
            </div>
          </ChatDetailTogglesProvider>
        </section>
      </LoadingProvider>
    );
  },
});
