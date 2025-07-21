import { Outlet } from "@tanstack/react-router";
import SideBar from "./SideBar";

export function MainLayout() {
  return (
    <>
      <SideBar />
      <Outlet />
    </>
  );
}
