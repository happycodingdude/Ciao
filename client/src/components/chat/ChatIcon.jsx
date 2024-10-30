const ChatIcon = (props) => {
  const { show } = props;

  return <div className={`fa fa-comment base-icon`} onClick={show}></div>;
};

export default ChatIcon;
