import { useFetchConversations } from "../../hook/CustomHooks";

const ChatIcon = (props) => {
  const { show, focus } = props;
  const { setSelected } = useFetchConversations();

  return (
    <div
      className={`${focus ? "text-[var(--main-color)]" : ""} fa fa-comment cursor-pointer text-xl font-thin`}
      // onClick={show}
      onClick={() => {
        setSelected(undefined);
        show();
      }}
    ></div>
  );
};

export default ChatIcon;
