import EmojiPicker from "emoji-picker-react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useEventListener, useInfo, useMessage } from "../../hook/CustomHooks";
import ImageWithLightBoxImgTag from "../common/ImageWithLightBoxImgTag";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";
import ChatboxMenu from "./ChatboxMenu";

const ChatInput = forwardRef((props, ref) => {
  const { send, className, quickChat, noMenu } = props;

  if (!ref) return;

  const { data: messages } = useMessage();
  const { data: info } = useInfo();

  // const inputRef = useRef();

  const [mentions, setMentions] = useState();
  const [showMention, setShowMention] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    ref.current.textContent = "";
    if (ref.current.classList.contains("chatbox")) ref.current.focus();
    // setTimeout(() => {
    //   if (ref.current) {
    //   }
    // }, 0);
    setFiles([]);
    setMentions(() => {
      return messages?.participants
        .filter((item) => item.contact.id !== info.id)
        .map((item) => {
          return {
            name: item.contact.name,
            avatar: item.contact.avatar ?? "images/imagenotfound.jpg",
            userId: item.contact.id,
          };
        });
    });
  }, [messages]);

  const setCaretToEnd = (addSpace) => {
    // ref.current.textContent += " ";
    if (addSpace) ref.current.innerHTML += "&nbsp;"; // Adds a non-breaking space
    ref.current.focus();

    // Create a range and set it to the end of the content
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    range.collapse(false); // Collapse the range to the end

    // Create a selection and add the range to it
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const chooseMention = (id) => {
    let user = mentions.find((item) => item.userId === id);
    ref.current.textContent = ref.current.textContent.replace("@", "");
    ref.current.textContent = ref.current.textContent += user.name;
    // ref.current.focus();
    setCaretToEnd(true);
    setShowMention(false);
  };

  const chat = () => {
    send(ref.current.textContent, files);
    ref.current.textContent = "";
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
    // const cursorPosition = ref.current.selectionStart;

    // Cái này cho element contenteditable
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(ref.current);
    clonedRange.setEnd(range.endContainer, range.endOffset);

    const cursorPosition = clonedRange.toString().length;
    // Ensure the cursor is not at the start (index 0)
    if (cursorPosition > 0) {
      const textBeforeCursor = ref.current.textContent.substring(
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
  const closeMentionOnClick = useCallback((e) => {
    if (e.target.closest(".mention-item")) return;
    setShowMention(false);
  }, []);
  useEventListener("click", closeMentionOnClick);

  const hideMentionOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      setShowMention(false);
    }
  }, []);
  useEventListener("keydown", hideMentionOnKey);

  const closeEmojiOnClick = useCallback((e) => {
    const classList = Array.from(e.target.classList);
    if (
      e.target.closest("emoji-item") ||
      classList.some((item) => item.includes("epr"))
    )
      return;
    setShowEmoji(false);
  }, []);
  useEventListener("click", closeEmojiOnClick);

  const closeEmojiOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      setShowEmoji(false);
    }
  }, []);
  useEventListener("keydown", closeEmojiOnKey);

  const chooseFile = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    const mergedFiles = chosenFiles.filter((item) => {
      if (!files.some((file) => file.name === item.name)) return item;
    });
    setFiles([...files, ...mergedFiles]);

    e.target.value = null;
  };

  const removeFile = (e) => {
    setFiles(files.filter((item) => item.name !== e.target.dataset.key));
  };

  useEffect(() => {
    if (files?.length !== 0) setCaretToEnd();
  }, [files]);

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
    <div
      className={`${className} relative grow rounded-[.5rem] bg-[var(--bg-color-extrathin)] laptop:max-w-[65rem]`}
    >
      {files?.length !== 0 ? (
        <div
          className={`file-container custom-scrollbar flex w-full gap-[1rem] overflow-x-auto scroll-smooth p-[.7rem]`}
        >
          {files?.map((item) => (
            <div
              className="relative flex aspect-square shrink-0 flex-col items-center justify-between gap-[1rem] rounded-[.5rem]
              bg-[var(--bg-color-thin)] p-3 laptop:w-[15rem]"
              //   className="relative flex aspect-square shrink-0 flex-col items-center justify-between gap-[1rem] rounded-[.5rem]
              // bg-white p-3 laptop:w-[15rem]"
            >
              <div className="absolute right-[-.5rem] top-[-.5rem] flex laptop:h-[3rem]">
                <div
                  data-key={item.name}
                  className="fa fa-trash cursor-pointer text-md text-[var(--danger-text-color)]"
                  onClick={removeFile}
                ></div>
              </div>
              <ImageWithLightBoxImgTag
                src={URL.createObjectURL(item)}
                // className="aspect-[4/3] w-full rounded-[.5rem] bg-[size:80%]"
                slides={[
                  {
                    src: URL.createObjectURL(item),
                  },
                ]}
              />
              <p className="self-start text-xs">{item.name}</p>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
      <div
        className={`mention-item relative w-full ${files?.length !== 0 ? "pt-3" : "pt-2"}`}
      >
        {messages.isGroup && !quickChat ? (
          <div
            data-show={showMention}
            className="hide-scrollbar absolute !top-[-20rem] left-0 flex flex-col overflow-y-scroll 
          scroll-smooth rounded-[.7rem] bg-[var(--bg-color-light)] p-2 text-sm transition-all duration-200
          data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto data-[show=false]:opacity-0 data-[show=true]:opacity-100 
          laptop:top-[-16rem] laptop:max-h-[20rem] laptop:w-[20rem]"
          >
            {mentions?.map((item) => (
              <div
                className="flex cursor-pointer gap-[1rem] rounded-[.7rem] p-3 hover:bg-[var(--bg-color-extrathin)]"
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
        {!noMenu ? (
          <ChatboxMenu
            chooseFile={chooseFile}
            className={`absolute left-[1rem] ${files?.length !== 0 ? "top-[1.3rem] " : "top-[.8rem] "}`}
          />
        ) : (
          ""
        )}
        <div
          // ref={inputRef}
          ref={ref}
          contentEditable={true}
          // data-text="Type something.."
          // aria-placeholder="Type something.."
          className={`hide-scrollbar w-full resize-none overflow-y-auto break-words 
            pb-2 outline-none laptop:max-h-[10rem] ${noMenu ? "px-3" : "px-16"}`}
          onKeyDown={keyBindingFn}
          onKeyUp={keyupBindingFn}
        ></div>
        <label
          className={`emoji-item fa fa-smile choose-emoji absolute right-[1rem] ${files?.length !== 0 ? "top-[1.3rem] " : "top-[.8rem] "} 
          cursor-pointer text-md font-normal`}
          onClick={() => setShowEmoji((show) => !show)}
        ></label>
      </div>
      <EmojiPicker
        open={showEmoji}
        width={300}
        height={400}
        onEmojiClick={(emoji) => (ref.current.textContent += emoji.emoji)}
        className="emoji-item !absolute right-[2rem] top-[-41rem]"
        icons="solid"
      />
    </div>
  );
});

export default ChatInput;
