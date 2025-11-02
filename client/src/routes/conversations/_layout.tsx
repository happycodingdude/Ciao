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
              <div className="flex h-screen w-[30rem] shrink-0 flex-col gap-[2rem] border-r-[.1rem] border-r-[var(--border-color)]">
                <ListChatHeaderContainer />
                <Suspense fallback={<ListchatLoading />}>
                  <Await promise={conversationPromise}>
                    {(data) => (
                      <div className="hide-scrollbar relative flex min-h-0 flex-1 flex-col gap-[2rem] overflow-y-scroll scroll-smooth px-[2rem] py-[1rem]">
                        <ListChatContainer />
                      </div>
                    )}
                  </Await>
                </Suspense>
              </div>
            </ListchatFilterProvider>
            <div className="relative h-screen w-full">
              <Outlet />
            </div>
          </ChatDetailTogglesProvider>
        </section>
      </LoadingProvider>
    );
  },
});
