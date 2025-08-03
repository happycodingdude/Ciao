import { createFileRoute } from "@tanstack/react-router";
import ChatboxContainer from "../../layouts/ChatboxContainer";

// export const Route = createFileRoute("/conversations/_layout/$conversationId")({
//   loader: async ({ params, context }) => {
//     const { queryClient } = context;
//     const conversationId = params.conversationId;
//     localStorage.setItem("conversationId", conversationId);

//     const messagesPromise = defer(
//       queryClient.ensureQueryData(messageQueryOption(conversationId, 1)),
//     );
//     const attachmentsPromise = defer(
//       queryClient.ensureQueryData(attachmentQueryOption(conversationId)),
//     );

//     return {
//       messagesPromise,
//       attachmentsPromise,
//     };
//   },
//   component: () => {
//     const { messagesPromise } = Route.useLoaderData();
//     return (
//       <Suspense fallback={<LocalLoading />}>
//         <Await promise={messagesPromise}>
//           {(data) => <ChatboxContainer />}
//         </Await>
//       </Suspense>
//     );
//   },
// });

export const Route = createFileRoute("/conversations/_layout/$conversationId")({
  loader: async ({ params, context }) => {
    const { queryClient } = context;
    const conversationId = params.conversationId;

    // Save current conversationId (optional)
    localStorage.setItem("conversationId", conversationId);

    // Invalidate cache to force refetch in component
    queryClient.invalidateQueries({ queryKey: ["message", conversationId] });
    queryClient.invalidateQueries({ queryKey: ["attachment", conversationId] });

    return { conversationId };
  },

  component: () => {
    return <ChatboxContainer />;
  },
});
