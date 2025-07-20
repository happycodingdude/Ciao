import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import getInfo from "../features/authentication/services/getInfo";

export const userQueryOptions = queryOptions({
  queryKey: ["info"],
  queryFn: getInfo,
});

// @ts-ignore
export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(userQueryOptions),
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}
