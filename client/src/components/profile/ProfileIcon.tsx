import { UserOutlined } from "@ant-design/icons";

const ProfileIcon = ({ onClick }: { onClick?: () => void }) => {
  // return <UserOutlined style={{ fontSize: "16px" }} />;
  return <UserOutlined className="base-icon" onClick={onClick} />;
};

export default ProfileIcon;
