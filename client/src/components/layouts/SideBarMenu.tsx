import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import useInfo from "../../hooks/useInfo";
import blurImage from "../../utils/blurImage";
import Signout from "../auth/Signout";

const SideBarMenu = () => {
  const { data: info } = useInfo();
  const queryClient = useQueryClient();

  if (!info) return;

  const handleChatClick = () => {
    console.log("Refreshing conversation list");
    // Clear selected conversation
    localStorage.removeItem("conversationId");
    // Dispatch event to notify ListChatContainer
    window.dispatchEvent(
      new CustomEvent("localstorage-changed", {
        detail: { key: "conversationId" },
      }),
    );
    // Refresh conversation list
    queryClient.invalidateQueries({ queryKey: ["conversation"] });
  };

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
      className="sidebar-3 bg-linear-to-br relative flex h-full w-full flex-col items-center 
      from-light-blue-300 to-light-blue-500 py-6"
    >
      <div className="z-10 mb-12 aspect-square w-[60%]">
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-white shadow-md">
          <i className="fa-solid fa-comments  text-light-blue-600"></i>
        </div>
      </div>

      <div className="z-10 flex w-[60%] flex-col gap-8">
        <Link to="/" className="sidebar-item">
          <i className="fa-solid fa-home "></i>
          <div className="tooltip">Home</div>
        </Link>
        <Link
          to="/conversations"
          className="sidebar-item"
          onClick={handleChatClick}
        >
          <i className="fa-solid fa-message"></i>
          <div className="tooltip">Chats</div>
        </Link>
        <Link to="/connections" className="sidebar-item">
          <i className="fa-solid fa-user-friends"></i>
          <div className="tooltip">Connections</div>
        </Link>
        <Link to="/notifications" className="sidebar-item">
          <i className="fa-solid fa-bell"></i>
          <div className="tooltip">Notifications</div>
        </Link>
        <Link to="/settings" className="sidebar-item">
          <i className="fa-solid fa-gear"></i>
          <div className="tooltip">Settings</div>
        </Link>
      </div>

      <Signout />
    </div>
  );
};

export default SideBarMenu;
