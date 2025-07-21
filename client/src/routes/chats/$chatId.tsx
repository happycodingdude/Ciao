import { createFileRoute } from "@tanstack/react-router";

// const chatDetailQueryOption = queryOptions({
//   queryKey: ["conversation"],
//   queryFn: () => getConversations(1),
// });

export const Route = createFileRoute("/chats/$chatId")({
  component: Component,
  loader: async ({ params }) => {
    return {
      chatId: params.chatId,
    };
  },
});

function Component() {
  const { chatId } = Route.useLoaderData();
  return <div>Hello {chatId}</div>;
}
