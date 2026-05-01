import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import Signout from "../auth/Signout";

const SideBarMenu = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const items = document.querySelectorAll(".sidebar-item");

    const handlers: Array<{ el: Element; fn: (e: Event) => void }> = [];

    items.forEach((item) => {
      const fn = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const htmlItem = item as HTMLElement;
        const rect = htmlItem.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        htmlItem.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);

        const sidebar = htmlItem.closest('[id^="sidebar-"]');
        sidebar?.querySelectorAll(".sidebar-item").forEach((el) => {
          el.classList.remove("active");
        });

        htmlItem.classList.add("active");
      };

      item.addEventListener("click", fn);
      handlers.push({ el: item, fn });
    });

    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    };
  }, []);

  const handleChatClick = () => {
    localStorage.removeItem("conversationId");
    window.dispatchEvent(
      new CustomEvent("localstorage-changed", {
        detail: { key: "conversationId" },
      }),
    );
    queryClient.invalidateQueries({ queryKey: ["conversation"] });
  };

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
