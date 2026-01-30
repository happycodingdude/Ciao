import { useFetchProfile } from "../../hook/CustomHooks";
import EditProfile from "./EditProfile";
import ProfileSetting from "./ProfileSetting";

const Profile = (props) => {
  const { onClose } = props;
  const { profile, setProfile, chooseAvatar, updateProfile } =
    useFetchProfile();

  return (
    <div className="flex w-full bg-[var(--bg-color)] text-base transition-all duration-500 [&>*]:p-16 ">
      <ProfileSetting profile={profile} onchange={chooseAvatar} />
      <EditProfile
        profile={profile}
        onChange={setProfile}
        onSave={() => updateProfile(onClose)}
        onClose={onClose}
      />
    </div>
  );
};

export default Profile;
