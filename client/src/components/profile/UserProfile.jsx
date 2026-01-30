import UserProfileSetting from "./UserProfileSetting";

const UserProfile = ({ id, onClose }) => {
  return <UserProfileSetting id={id} onClose={onClose} />;
};

export default UserProfile;
