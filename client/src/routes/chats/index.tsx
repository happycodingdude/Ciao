import { createFileRoute } from "@tanstack/react-router";
import { SignalProvider } from "../../context/SignalContext";
import Home from "../../pages/Home";

export const Route = createFileRoute("/chats/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SignalProvider>
      <Home />
    </SignalProvider>
  );
}
