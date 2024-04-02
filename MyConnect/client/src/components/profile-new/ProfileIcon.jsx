const ProfileIcon = (props) => {
  const { show, focus } = props;

  return (
    <div
      className={`${focus ? "text-[var(--main-color)]" : ""} fa fa-user cursor-pointer text-xl font-thin`}
      onClick={show}
    ></div>
  );
};

export default ProfileIcon;
