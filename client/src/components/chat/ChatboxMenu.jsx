import React, { useCallback, useState } from "react";
import { useEventListener } from "../../hook/CustomHooks";

const ChatboxMenu = (props) => {
  console.log("ChatboxMenu calling");
  const { chooseFile, setEmojiText } = props;

  const [openEmoji, setOpenEmoji] = useState(false);

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

  return (
    <div className="relative flex h-full items-center">
      <div
        // data-show={show}
        className="hide-scrollbar absolute left-0 flex aspect-[4/3] flex-col gap-[1rem] overflow-y-scroll 
        scroll-smooth rounded-[.5rem] bg-[var(--bg-color-light)] text-sm transition-all duration-200
        data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:opacity-0 data-[show=true]:opacity-100 
        laptop:top-[-16rem] laptop:w-[20rem]"
      ></div>
      <div className="fa fa-bars flex cursor-pointer items-center justify-center text-md font-normal"></div>
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
