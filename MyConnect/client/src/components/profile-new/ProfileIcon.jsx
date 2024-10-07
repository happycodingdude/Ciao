const ProfileIcon = (props) => {
  const { show } = props;

  return (
    <div
      className={`fa fa-user flex cursor-pointer items-center justify-center text-xl font-thin text-[var(--text-main-color-normal)]`}
      onClick={show}
    ></div>
  );
};

export default ProfileIcon;
