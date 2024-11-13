// import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

const ProfileIcon = (props) => {
  const { show } = props;

  return <div className={`fa fa-user base-icon`} onClick={show}></div>;
  // return (
  //   <PersonOutlineOutlinedIcon sx={{ fontSize: "1.8rem" }} onClick={show} />
  // );
};

export default ProfileIcon;
