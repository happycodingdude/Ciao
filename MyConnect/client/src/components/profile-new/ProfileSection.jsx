import { useEffect, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useAuth, useFetchProfile } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import MediaPicker from "../common/MediaPicker";

const ProfileSection = () => {
  const { valid } = useAuth();
  const { profile, setProfile, chooseAvatar, updateProfile, reFetch } =
    useFetchProfile();
  const profileContainer = useRef();

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    reFetch(controller);
    return () => {
      controller.abort();
    };
  }, [valid]);

  return (
    <div
      className="flex flex-col gap-[5rem] px-[5rem] py-[2rem]"
      ref={profileContainer}
    >
      <p className="text-xl font-bold">Edit user profile</p>
      <div className="flex flex-col gap-[1rem] laptop:w-[30rem]">
        <div className="relative flex w-full">
          <ImageWithLightBoxWithBorderAndShadow
            src={profile?.avatar ?? ""}
            className="aspect-square cursor-pointer rounded-[50%] border-l-[.4rem] border-r-[.4rem] border-t-[.4rem] laptop:w-[40%]"
            slides={[
              {
                src: profile?.avatar ?? "",
              },
            ]}
          />
          <MediaPicker
            className="absolute left-[2%] top-[-10%] text-xl"
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
        onClick={() => {
          updateProfile();
        }}
      />
    </div>
  );
};

export default ProfileSection;
