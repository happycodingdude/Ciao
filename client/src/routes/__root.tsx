import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    )
  },
})

function RootComponent() {
  return (
    <>
      <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/chats" className="[&.active]:font-bold">
          Chats
        </Link>
      </div>
      <hr />
      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools />
    </>
  );
};

// export const RootComponent = createRootRoute({
//   component: () => (
//     <>
//       <div className="flex gap-2 p-2">
//         <Link to="/" className="[&.active]:font-bold">
//           Home
//         </Link>
//         <Link to="/about" className="[&.active]:font-bold">
//           About
//         </Link>
//         <Link to="/chats" className="[&.active]:font-bold">
//           Chats
//         </Link>
//       </div>
//       <hr />
//       <Outlet />
//       <TanStackRouterDevtools />
//     </>
//   ),
// });

// export const RootComponent = () => {
//   return (
//     <>
//       <div className="flex gap-2 p-2">
//         <Link to="/" className="[&.active]:font-bold">
//           Home
//         </Link>
//         <Link to="/about" className="[&.active]:font-bold">
//           About
//         </Link>
//         <Link to="/chats" className="[&.active]:font-bold">
//           Chats
//         </Link>
//       </div>
//       <hr />
//       <Outlet />
//       <TanStackRouterDevtools />
//     </>
//   );
// };
