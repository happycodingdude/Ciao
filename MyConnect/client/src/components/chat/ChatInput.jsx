import { Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { useInfo, useMessage } from "../../hook/CustomHooks";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";

const ChatInput = (props) => {
  const { send, emoji } = props;

  const { data: messages } = useMessage();
  const { data: info } = useInfo();

  const [text, setText] = useState("");
  const [mentions, setMentions] = useState();
  const [show, setShow] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setText("");
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

  useEffect(() => {
    if (!emoji) return;
    setText((current) => (current += emoji));
  }, [emoji]);

  // const onChangeInput = (e) => {
  //   setText(e.target.value)
  // }

  const chat = () => {
    send(inputRef.current.value);
    inputRef.current.value = "";
  };

  const keyBindingFn = (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      chat();
    } else if (e.key === "@") {
      console.log("show mentions");
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const chooseMention = (id) => {
    console.log(id);
    let user = mentions.find((item) => item.userId === id);
    inputRef.current.value = inputRef.current.value.replace("@", "");
    inputRef.current.value = inputRef.current.value += user.name;
    inputRef.current.focus();
    setShow(false);
  };

  return (
    <div className="relative max-h-[10rem] max-w-[50rem] grow">
      <div
        data-show={show}
        className="hide-scrollbar absolute left-0 flex aspect-[4/3] flex-col gap-[1rem] overflow-y-scroll 
        scroll-smooth rounded-[.5rem] bg-[var(--bg-color-light)] text-sm transition-all duration-200
        data-[show=false]:opacity-0 data-[show=true]:opacity-100 laptop:top-[-16rem] laptop:w-[20rem]"
      >
        {mentions?.map((item) => (
          <div
            className="flex cursor-pointer gap-[1rem] p-2 hover:bg-[var(--bg-color-extrathin)]"
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
      <input
        ref={inputRef}
        // value={text}
        // onChange={onChangeInput}
        className="w-full rounded-2xl bg-[var(--bg-color-extrathin)] py-2 pl-4 pr-16 outline-none"
        onKeyDown={keyBindingFn}
      />
      <div className="absolute right-[1%] top-0 flex h-full grow cursor-pointer items-center justify-center">
        <Tooltip title="Send">
          <div
            className="fa fa-paper-plane flex aspect-square h-full items-center justify-center rounded-[.8rem] text-[var(--main-color-light)]"
            onClick={chat}
          ></div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatInput;
