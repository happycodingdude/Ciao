import EmojiPicker from "emoji-picker-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener, useInfo, useMessage } from "../../hook/CustomHooks";
import ImageWithLightBoxImgTag from "../common/ImageWithLightBoxImgTag";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";
import ChatboxMenu from "./ChatboxMenu";

const ChatInput = (props) => {
  const { send } = props;

  const { data: messages } = useMessage();
  const { data: info } = useInfo();

  const inputRef = useRef();

  const [mentions, setMentions] = useState();
  const [showMention, setShowMention] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    inputRef.current.innerText = "";
    setFiles([]);
    setMentions(() => {
      return messages?.participants
        .filter((item) => item.contact.id !== info.data.id)
        .map((item) => {
          return {
            name: item.contact.name,
            avatar: item.contact.avatar ?? "images/imagenotfound.jpg",
            userId: item.contact.id,
          };
        });
    });
  }, [messages]);

  const chooseMention = (id) => {
    let user = mentions.find((item) => item.userId === id);
    inputRef.current.innerText = inputRef.current.innerText.replace("@", "");
    inputRef.current.innerText = inputRef.current.innerText += user.name;
    inputRef.current.focus();
    setShow(false);
  };

  const chat = () => {
    send(inputRef.current.innerText, files);
    inputRef.current.innerText = "";
    setFiles([]);
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      chat();
    } else if (e.key === "@") {
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const keyupBindingFn = (e) => {
    e.preventDefault();

    // Cái này cho element input
    // const cursorPosition = inputRef.current.selectionStart;

    // Cái này cho element contenteditable
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(inputRef.current);
    clonedRange.setEnd(range.endContainer, range.endOffset);

    const cursorPosition = clonedRange.toString().length;
    // Ensure the cursor is not at the start (index 0)
    if (cursorPosition > 0) {
      const textBeforeCursor = inputRef.current.innerText.substring(
        0,
        cursorPosition,
      );
      const charBeforeCursor = textBeforeCursor[textBeforeCursor.length - 1];

      // console.log("Character before cursor:", charBeforeCursor);

      if (charBeforeCursor === "@" && e.keyCode === 32 && e.ctrlKey)
        setShowMention(true);
    }
  };

  // Event listener
  const hideMentionOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      setShowMention(false);
    }
  }, []);
  useEventListener("keydown", hideMentionOnKey);

  const closeMentionOnClick = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (classList.some((item) => item === "mention-item")) return;
    setShowMention(false);
  }, []);
  useEventListener("click", closeMentionOnClick);

  const hideEmojiOnClick = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (
      classList.some((item) => item === "emoji-item") ||
      classList.some((item) => item.includes("epr"))
    )
      return;
    setShowEmoji(false);
  }, []);
  useEventListener("click", hideEmojiOnClick);

  const hideEmojiOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      setShowEmoji(false);
    }
  }, []);
  useEventListener("keydown", hideEmojiOnKey);

  const chooseFile = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles([...files, ...mergedFiles]);

    e.target.value = null;

    inputRef.current.focus();
  };

  const removeFile = (e) => {
    setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  };

  // useEffect(() => {
  //   if (!files || files.length === 0) return;

  //   const fileContainer = document.querySelector(".file-container");
  //   const callback = (e) => {
  //     e.preventDefault();

  //     fileContainer.scrollBy({
  //       left: e.deltaY < 0 ? -100 : 100,
  //     });
  //   };
  //   fileContainer.addEventListener("wheel", callback, true);
  //   return () => {
  //     fileContainer.removeEventListener("wheel", callback, true);
  //   };
  // }, [files]);

  // const expandTextarea = useCallback((e) => {
  //   e.target.style.height = "auto";
  //   e.target.style.height = e.target.scrollHeight + "px";
  // }, []);

  return (
    <div className="relative grow bg-[var(--bg-color-extrathin)] px-2 laptop:max-w-[65rem]">
      {messages.isGroup ? (
        <div
          data-show={showMention}
          className="mention-item hide-scrollbar absolute left-0 flex flex-col gap-[1rem] overflow-y-scroll 
          scroll-smooth rounded-[.5rem] bg-[var(--bg-color-light)] text-sm transition-all duration-200
          data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:opacity-0 data-[show=true]:opacity-100 
          laptop:top-[-20rem] laptop:h-[20rem] laptop:w-[20rem]"
        >
          {mentions?.map((item) => (
            <div
              className="flex cursor-pointer gap-[1rem] p-3 hover:bg-[var(--bg-color-extrathin)]"
              // data-user={item.userId}
              onClick={() => chooseMention(item.userId)}
            >
              <ImageWithLightBoxWithShadowAndNoLazy
                src={item.avatar}
                className="aspect-square cursor-pointer rounded-[50%] laptop:w-[3rem]"
                slides={[
                  {
                    src: item.avatar,
                  },
                ]}
                onClick={() => {}}
              />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
      {files?.length !== 0 ? (
        <div
          className={`file-container custom-scrollbar flex w-full gap-[1rem] overflow-x-auto scroll-smooth p-[.7rem]`}
        >
          {files?.map((item) => (
            <div
              className="relative flex aspect-square shrink-0 flex-col items-center justify-between gap-[1rem] rounded-[.5rem] 
            bg-[var(--bg-color-light)] p-3 laptop:w-[15rem]"
            >
              <ImageWithLightBoxImgTag
                src={URL.createObjectURL(item)}
                // className="aspect-[4/3] w-full rounded-[.5rem] bg-[size:80%]"
                slides={[
                  {
                    src: URL.createObjectURL(item),
                  },
                ]}
              />
              {/* <div
                style={{
                  "--image-url": ["doc", "docx", "xls", "xlsx", "pdf"].includes(
                    item.name.split(".")[1],
                  )
                    ? "url('images/imagenotfound.jpg')"
                    : `url('${URL.createObjectURL(item)}'`,
                }}
                className={`relative aspect-[4/3] w-full rounded-[.5rem] bg-[image:var(--image-url)] bg-[size:100%] bg-center bg-no-repeat`}
                title={item.name.split(".")[0]}
              >
                <span
                  data-key={item.name}
                  // onClick={removeFile}
                  className="fa fa-times-circle absolute right-[0] top-[-5%] z-[1] aspect-square w-[1rem] cursor-pointer rounded-[50%] 
                    bg-white text-[var(--danger-text-color)] hover:text-[var(--danger-text-color-normal)]"
                  title="Clear image"
                ></span>
              </div> */}
              <p className="self-start text-xs">{item.name}</p>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
      {/* <input
        ref={inputRef}
        // rows={files?.length !== 0 ? 4 : 1}
        // rows={4}
        onInput={expandTextarea}
        className="mention-item hide-scrollbar !h-[10rem] w-full resize-none break-words rounded-2xl bg-[var(--bg-color-extrathin)] py-2 pl-4 pr-16 outline-none laptop:max-h-[10rem]"
        onKeyDown={keyBindingFn}
        onKeyUp={keyupBindingFn}
      /> */}
      <div
        className={`relative w-full ${files?.length !== 0 ? "pt-3" : "pt-2"}`}
      >
        <ChatboxMenu
          chooseFile={chooseFile}
          className={`absolute left-[1rem] ${files?.length !== 0 ? "top-[1.5rem] " : "top-[1rem] "}`}
        />
        <div
          ref={inputRef}
          contentEditable={true}
          // data-text="Type something.."
          // aria-placeholder="Type something.."
          className={`mention-item hide-scrollbar w-full resize-none overflow-y-auto break-words px-16 pb-2 outline-none
            laptop:max-h-[10rem]`}
          onKeyDown={keyBindingFn}
          onKeyUp={keyupBindingFn}
        ></div>
        <label
          className={`emoji-item fa fa-smile choose-emoji absolute right-[1rem] ${files?.length !== 0 ? "top-[1.5rem] " : "top-[.8rem] "} 
          cursor-pointer text-lg font-normal`}
          onClick={() => setShowEmoji((show) => !show)}
        ></label>
      </div>
      <EmojiPicker
        open={showEmoji}
        width={300}
        height={400}
        onEmojiClick={(emoji) => (inputRef.current.value += emoji.emoji)}
        className="emoji-item !absolute right-[2rem] top-[-41rem]"
      />
    </div>
  );
};

export default ChatInput;
