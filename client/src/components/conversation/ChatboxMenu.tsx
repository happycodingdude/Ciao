import { MenuOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import { ChatboxMenuProps } from "../../types/conv.types";

const ChatboxMenu = (props: ChatboxMenuProps) => {
  const { chooseFile, className } = props;

  const [show, setShow] = useState(false);

  const hideMenuOnClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (Array.from(target.classList).includes("chatbox-menu-item")) return;
    setShow(false);
  }, []);
  useEventListener("click", hideMenuOnClick);

  return (
    <div className={`${className}`}>
      <div className="relative flex h-full items-center">
        <div
          data-show={show}
          className="chatbox-menu-item absolute left-0 -top-40 z-10 flex w-[20rem] origin-bottom-left flex-col gap-2
        rounded-[.7rem] bg-(--bg-color) text-(--text-main-color) transition-all duration-200
        data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:scale-0 data-[show=true]:scale-100"
        >
          <div className="chatbox-menu-item flex cursor-pointer items-center gap-4 rounded-[.7rem] pl-4 leading-16 hover:bg-(--main-color-extrathin)">
            <input
              multiple
              type="file"
              accept="image/*"
              className="hidden"
              id="choose-image"
              onChange={chooseFile}
            />
            <label
              htmlFor="choose-image"
              className="chatbox-menu-item w-full cursor-pointer"
            >
              <i className="fa fa-image text-md relative top-[.2rem] w-12 font-light"></i>
              Upload an image
            </label>
          </div>
          <div className="chatbox-menu-item flex cursor-pointer items-center gap-4 rounded-[.7rem] pl-4 leading-16 hover:bg-(--main-color-extrathin)">
            <input
              multiple
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.pdf"
              className="hidden"
              id="choose-file"
              onChange={chooseFile}
            />
            <label
              htmlFor="choose-file"
              className="chatbox-menu-item w-full cursor-pointer"
            >
              <i className="fa fa-file text-md relative left-[.3rem] w-12 font-light"></i>
              Upload a file
            </label>
          </div>
        </div>
        <MenuOutlined onClick={() => setShow((show) => !show)} />
      </div>
    </div>
  );
};

export default ChatboxMenu;
