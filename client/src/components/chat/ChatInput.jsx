import EmojiPicker from "emoji-picker-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener, useInfo, useMessage } from "../../hook/CustomHooks";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";

const ChatInput = (props) => {
  const { files, send } = props;

  const { data: messages } = useMessage();
  const { data: info } = useInfo();

  const inputRef = useRef();

  const [mentions, setMentions] = useState();
  const [showMention, setShowMention] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    inputRef.current.value = "";
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
    inputRef.current.value = inputRef.current.value.replace("@", "");
    inputRef.current.value = inputRef.current.value += user.name;
    inputRef.current.focus();
    setShow(false);
  };

  const chat = () => {
    send(inputRef.current.value);
    inputRef.current.value = "";
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      chat();
    } else if (e.key === "@") {
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const keyupBindingFn = (e) => {
    const cursorPosition = inputRef.current.selectionStart;
    // Ensure the cursor is not at the start (index 0)
    if (cursorPosition > 0) {
      const textBeforeCursor = inputRef.current.value.substring(
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

  useEffect(() => {
    if (!files || files.length === 0) return;

    const fileContainer = document.querySelector(".file-container");
    const callback = (e) => {
      e.preventDefault();

      fileContainer.scrollBy({
        left: e.deltaY < 0 ? -30 : 30,
      });
    };
    fileContainer.addEventListener("wheel", callback, true);
    return () => {
      fileContainer.removeEventListener("wheel", callback, true);
    };
  }, [files]);

  const expandTextarea = useCallback((e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }, []);

  return (
    <div className="relative grow laptop:max-w-[60rem]">
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
        <>
          <div
            // className={`${
            //   files.length === 1
            //     ? "grid-cols-[12rem] p-[.5rem]"
            //     : "p-[.7rem] laptop:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] desktop:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]"
            // }
            // className={`hide-scrollbar absolute top-0 grid max-h-[7rem] gap-[1rem] overflow-x-auto
            //   rounded-[.8rem] p-[.7rem]
            //   laptop:w-[clamp(41rem,73%,61rem)] laptop:grid-cols-[repeat(auto-fill,9rem)]
            //   desktop:w-[clamp(70rem,75%,120rem)] desktop:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]`}
            className={`file-container hide-scrollbar absolute top-0 flex max-h-[7rem] w-[90%] gap-[1rem]
              overflow-x-scroll rounded-[.8rem] p-[.7rem] laptop:h-[7rem]`}
          >
            {files?.map((item) => (
              <div
                style={{
                  "--image-url": ["doc", "docx", "xls", "xlsx", "pdf"].includes(
                    item.name.split(".")[1],
                  )
                    ? "url('images/imagenotfound.jpg')"
                    : `url('${URL.createObjectURL(item)}'`,
                }}
                className={`relative aspect-video rounded-[.8rem] bg-[image:var(--image-url)] bg-[size:100%] bg-center laptop:w-[10rem]`}
                title={item.name.split(".")[0]}
              >
                <span
                  data-key={item.name}
                  // onClick={removeFile}
                  className="fa fa-times-circle absolute right-[0] top-[-5%] z-[1] aspect-square w-[1rem] cursor-pointer rounded-[50%] 
                    bg-white text-[var(--danger-text-color)] hover:text-[var(--danger-text-color-normal)]"
                  title="Clear image"
                ></span>
              </div>
            ))}
          </div>
        </>
      ) : (
        ""
      )}
      <textarea
        ref={inputRef}
        // rows={files?.length !== 0 ? 4 : 1}
        // rows={4}
        onInput={expandTextarea}
        className="mention-item hide-scrollbar w-full resize-none rounded-2xl bg-[var(--bg-color-extrathin)] py-2 pl-4 pr-16 outline-none laptop:max-h-[10rem]"
        onKeyDown={keyBindingFn}
        onKeyUp={keyupBindingFn}
      />
      <label
        className="emoji-item fa fa-smile choose-emoji absolute right-[1rem] top-[40%] cursor-pointer text-lg
          font-normal"
        onClick={() => setShowEmoji((show) => !show)}
      ></label>
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
