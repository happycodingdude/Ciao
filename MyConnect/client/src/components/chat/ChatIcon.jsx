const ChatIcon = (props) => {
  const { show, focus } = props;

  return (
    <div
      className={`${focus ? "text-[var(--main-color)]" : ""} fa fa-comment cursor-pointer text-xl font-thin`}
      onClick={show}
    ></div>
  );
};

export default ChatIcon;
