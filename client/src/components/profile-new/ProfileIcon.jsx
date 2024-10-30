const ProfileIcon = (props) => {
  const { show } = props;

  return <div className={`fa fa-user base-icon`} onClick={show}></div>;
};

export default ProfileIcon;
