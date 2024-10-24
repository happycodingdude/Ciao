// import EmojiPicker from "emoji-picker-react";
import React, { useCallback, useState } from "react";
import { useEventListener } from "../../hook/CustomHooks";

const ChatboxMenu = (props) => {
  console.log("ChatboxMenu calling");
  const { chooseFile, setEmojiText } = props;

  const [openEmoji, setOpenEmoji] = useState(false);
  const [show, setShow] = useState(false);

  // Event listener
  const closeEmoji = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (
      classList.some((item) => item === "choose-emoji") ||
      classList.some((item) => item.includes("epr"))
    )
      return;
    setOpenEmoji(false);
  }, []);
  useEventListener("click", closeEmoji);
  // Event listener
  const hideMenuOnClick = useCallback((e) => {
    if (Array.from(e.target.classList).includes("chatbox-menu-item")) return;
    setShow(false);
  }, []);
  useEventListener("click", hideMenuOnClick);

  return (
    <div className="relative flex h-full items-center">
      <div
        data-show={show}
        className="chatbox-menu-item data-[show=true]:scale-1 absolute left-0 top-[-10rem] flex w-[20rem] origin-bottom-left
        flex-col rounded-[.7rem] bg-[var(--bg-color-light)] p-2 text-sm text-[var(--text-main-color)] transition-all
        duration-200 data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:scale-0"
      >
        <div className="chatbox-menu-item flex cursor-pointer items-center gap-[1rem] p-3 hover:bg-[var(--bg-color-thin)]">
          <input
            multiple
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            id="choose-image"
            onChange={chooseFile}
          ></input>
          <label
            for="choose-image"
            className="chatbox-menu-item cursor-pointer"
          >
            <i className="fa fa-image relative top-[.2rem] w-[3rem] text-lg font-light"></i>
            Upload an image
          </label>
        </div>
        <div className="chatbox-menu-item flex cursor-pointer items-center gap-[1rem] p-3 hover:bg-[var(--bg-color-thin)]">
          <input
            multiple
            type="file"
            accept=".doc,.docx,.xls,.xlsx,.pdf"
            className="hidden"
            id="choose-file"
            onChange={chooseFile}
          ></input>
          <label for="choose-file" className="chatbox-menu-item cursor-pointer">
            <i className="fa fa-file relative left-[.3rem] w-[3rem] text-lg font-light"></i>
            Upload a file
          </label>
        </div>
        {/* <div className="relative">
          <Tooltip title="Emoji">
            <label
              className="fa fa-smile choose-emoji cursor-pointer font-normal"
              onClick={() => setOpenEmoji(true)}
            ></label>
          </Tooltip>
          <EmojiPicker
            open={openEmoji}
            width={300}
            height={400}
            className="!absolute !bottom-[3rem] !left-[1rem] !z-[1000]"
            onEmojiClick={(emoji) => setEmojiText(emoji.emoji)}
          />
        </div> */}
      </div>
      <div
        onClick={() => setShow((show) => !show)}
        className="chatbox-menu-item fa fa-bars flex cursor-pointer items-center justify-center text-md font-normal"
      ></div>
    </div>
    // <div className="flex max-w-[10rem] grow items-center justify-evenly">
    //   <input
    //     multiple
    //     type="file"
    //     accept="image/png, image/jpeg"
    //     className="hidden"
    //     id="choose-image"
    //     onChange={chooseFile}
    //   ></input>
    //   <Tooltip title="Choose image">
    //     <label
    //       for="choose-image"
    //       className="fa fa-image cursor-pointer font-normal"
    //     ></label>
    //   </Tooltip>
    //   <input
    //     multiple
    //     type="file"
    //     accept=".doc,.docx,.xls,.xlsx,.pdf"
    //     className="hidden"
    //     id="choose-file"
    //     onChange={chooseFile}
    //   ></input>
    //   <Tooltip title="Choose file">
    //     <label
    //       for="choose-file"
    //       className="fa fa-file cursor-pointer font-normal"
    //     ></label>
    //   </Tooltip>
    //   <div className="relative">
    //     <Tooltip title="Emoji">
    //       <label
    //         className="fa fa-smile choose-emoji cursor-pointer font-normal"
    //         onClick={() => setOpenEmoji(true)}
    //       ></label>
    //     </Tooltip>
    //     <EmojiPicker
    //       open={openEmoji}
    //       width={300}
    //       height={400}
    //       className="!absolute !bottom-[3rem] !left-[1rem] !z-[1000]"
    //       onEmojiClick={(emoji) => setEmojiText(emoji.emoji)}
    //     />
    //   </div>
    // </div>
  );
};

export default ChatboxMenu;
