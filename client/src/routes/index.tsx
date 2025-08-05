import { createFileRoute } from "@tanstack/react-router";
import Home from "../pages/Home";

export const Route = createFileRoute("/")({
  component: Home,
});

// function Component() {
//   return (
//     <LoadingProvider>
//       <SignalProvider>
//         <Home />
//       </SignalProvider>
//     </LoadingProvider>
//   );
// }
