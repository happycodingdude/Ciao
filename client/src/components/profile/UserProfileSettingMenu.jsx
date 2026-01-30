import Signout from "../sidebar/Signout";

const UserProfileSettingMenu = ({ onClick }) => {
  return (
    <div className="flex flex-col gap-[2rem]">
      <Signout className="text-red-500" />
      <Signout className="text-red-500" />
      <Signout className="text-red-500" />
    </div>
  );
};

export default UserProfileSettingMenu;
