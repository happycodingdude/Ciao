import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import Signout from "../features/authentication/components/Signout";
import useInfo from "../features/authentication/hooks/useInfo";
import "../sidebar.css";
import { SideBarProps } from "../types";
import blurImage from "../utils/blurImage";

const SideBarMenu = (props: SideBarProps) => {
  // console.log("SideBar calling");
  // const { page, setPage } = props;

  const router = useRouter();

  // console.log(router.state.location);

  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", function (e: MouseEvent) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);

      // Remove active class from all items in the same sidebar
      const sidebar = this.closest('[id^="sidebar-"]');
      sidebar.querySelectorAll(".sidebar-item").forEach((el) => {
        el.classList.remove("active");
      });

      // Add active class to clicked item
      this.classList.add("active");
    });
  });

  return (
    <div
      id="sidebar-3"
      className="sidebar-3 relative flex h-full w-full flex-col items-center bg-gradient-to-br from-neo-purple/90 to-neo-pink/90 py-[3rem]"
    >
      {/* <div className="bg-neo-blue/40 absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl"></div>
      <div className="bg-neo-pink/40 absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl"></div> */}

      <div className="z-10 mb-[6rem] aspect-square w-[70%]">
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-white shadow-md">
          <i className="fa-solid fa-comments text-2xl text-neo-purple"></i>
        </div>
      </div>

      <div className="z-10 flex w-[70%] flex-1 flex-col gap-[2rem]">
        <Link to="/" className="sidebar-item">
          <i className="fa-solid fa-home text-xl"></i>
          <div className="tooltip">Home</div>
        </Link>
        <Link to="/conversations" className="sidebar-item">
          <i className="fa-solid fa-message text-xl"></i>
          <div className="tooltip">Messages</div>
        </Link>
        <Link to="/connections" className="sidebar-item">
          <i className="fa-solid fa-user-friends text-xl"></i>
          <div className="tooltip">Messages</div>
        </Link>
        <Link to="/notifications" className="sidebar-item">
          <i className="fa-solid fa-bell text-xl"></i>
          <div className="tooltip">Notifications</div>
        </Link>
        <Link to="/settings" className="sidebar-item">
          <i className="fa-solid fa-gear text-xl"></i>
          <div className="tooltip">Settings</div>
        </Link>
      </div>

      <ImageWithLightBoxAndNoLazy
        src={info.avatar}
        className="h-[4rem] w-[4rem] cursor-pointer"
        slides={[
          {
            src: info.avatar,
          },
        ]}
        circle
      />

      <Signout className="mt-4 text-white" />
    </div>
  );
};

export default SideBarMenu;
