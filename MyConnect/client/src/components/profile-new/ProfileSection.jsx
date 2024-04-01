import { useFetchProfile } from "../../hook/CustomHooks";

const ProfileSection = (props) => {
  const { show } = props;
  const { reFetch } = useFetchProfile();

  const openProfile = () => {
    reFetch();
    // setOpen(true);
  };

  return (
    <div
      className={`fa fa-user notification-trigger relative cursor-pointer text-xl font-thin`}
      onClick={openProfile}
    ></div>
  );
};

export default ProfileSection;
