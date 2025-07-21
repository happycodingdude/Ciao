import { createFileRoute } from "@tanstack/react-router";
import { AuthenticationContainer } from "../../pages/Authentication";

export const Route = createFileRoute("/auth/")({
  component: AuthenticationContainer,
});
