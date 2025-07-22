import { Outlet } from "@tanstack/react-router";
import SideBar from "./SideBar";

export function MainLayout() {
  return (
    <>
      <SideBar />
      <div className="relative grow">
        <Outlet />
      </div>
    </>
  );
}
