// import EmojiPicker from "emoji-picker-react";
import React, { useCallback, useState } from "react";
import useEventListener from "../../../hooks/useEventListener";
import { ChatboxMenuProps } from "../types";

const ChatboxMenu = (props: ChatboxMenuProps) => {
  // console.log("ChatboxMenu calling");
  const { chooseFile, className } = props;

  const [show, setShow] = useState(false);

  // Event listener
  const hideMenuOnClick = useCallback((e) => {
    if (Array.from(e.target.classList).includes("chatbox-menu-item")) return;
    setShow(false);
  }, []);
  useEventListener("click", hideMenuOnClick);

  return (
    <div className={`${className}`}>
      <div className="relative flex h-full items-center">
        <div
          data-show={show}
          className="chatbox-menu-item absolute left-0 top-[-10rem] z-[10] flex w-[20rem] origin-bottom-left flex-col gap-[.5rem]
        rounded-[.7rem] bg-[var(--bg-color-light)] text-[var(--text-main-color)] transition-all duration-200
        data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:scale-0 data-[show=true]:scale-100"
        >
          <div className="chatbox-menu-item flex cursor-pointer items-center gap-[1rem] rounded-[.7rem] pl-[1rem] leading-[4rem] hover:bg-[var(--main-color-extrathin)]">
            <input
              multiple
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              id="choose-image"
              onChange={chooseFile}
            ></input>
            <label
              htmlFor="choose-image"
              className="chatbox-menu-item w-full cursor-pointer"
            >
              <i className="fa fa-image relative top-[.2rem] w-[3rem] text-md font-light"></i>
              Upload an image
            </label>
          </div>
          <div className="chatbox-menu-item flex cursor-pointer items-center gap-[1rem] rounded-[.7rem] pl-[1rem] leading-[4rem] hover:bg-[var(--main-color-extrathin)]">
            <input
              multiple
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.pdf"
              className="hidden"
              id="choose-file"
              onChange={chooseFile}
            ></input>
            <label
              htmlFor="choose-file"
              className="chatbox-menu-item w-full cursor-pointer"
            >
              <i className="fa fa-file relative left-[.3rem] w-[3rem] text-md font-light"></i>
              Upload a file
            </label>
          </div>
        </div>
        <div
          onClick={() => setShow((show) => !show)}
          className="chatbox-menu-item fa fa-bars flex cursor-pointer items-center justify-center text-md font-normal"
        ></div>
      </div>
    </div>
  );
};

export default ChatboxMenu;
