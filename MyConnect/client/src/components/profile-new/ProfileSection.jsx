import { useEffect } from "react";
import { useFetchProfile } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import MediaPicker from "../common/MediaPicker";

const ProfileSection = (props) => {
  const { profile, setProfile, chooseAvatar, updateProfile, reFetch } =
    useFetchProfile();

  useEffect(() => {
    const controller = new AbortController();
    reFetch(controller);
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="flex flex-col gap-[5rem] px-[5rem] py-[2rem]">
      <p className="text-lg font-medium">Edit user profile</p>
      <div className="flex flex-col gap-[1rem] laptop:w-[30rem]">
        <div className="relative flex w-full">
          <ImageWithLightBoxWithBorderAndShadow
            src={profile?.avatar ?? ""}
            className="aspect-square w-[50%] cursor-pointer rounded-[50%] border-l-[.4rem] border-r-[.4rem] border-t-[.4rem]"
            slides={[
              {
                src: profile?.avatar ?? "",
              },
            ]}
          />
          <MediaPicker
            className="absolute left-[5%] top-[-10%] text-xl"
            accept="image/png, image/jpeg"
            id="customer-avatar"
            onChange={chooseAvatar}
          />
        </div>
        <div className="flex flex-col gap-[.5rem]">
          <p className="[var(--shadow-color-blur)]">Name</p>
          <input
            value={profile?.name}
            className="rounded-lg border-[.2rem] border-[var(--shadow-color-blur)] px-4 py-2 font-medium outline-none transition-all duration-200"
            type="text"
            onChange={(e) => {
              setProfile({ ...profile, name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-[.5rem]">
          <p className="[var(--shadow-color-blur)]">Bio</p>
          <textarea
            rows={4}
            value={profile?.bio}
            className="hide-scrollbar resize-none rounded-lg border-[.2rem] border-[var(--shadow-color-blur)] px-4 py-2 font-medium outline-none transition-all duration-200"
            type="text"
            onChange={(e) => {
              setProfile({ ...profile, bio: e.target.value });
            }}
          />
        </div>
      </div>
      <CustomButton
        title="Save"
        className="!ml-0 h-[10%] !w-[30%]"
        onClick={updateProfile}
      />
    </div>
  );
};

export default ProfileSection;
