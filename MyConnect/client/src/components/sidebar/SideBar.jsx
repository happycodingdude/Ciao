import React, { useCallback, useState } from "react";
import {
  useAuth,
  useEventListener,
  useFetchProfile,
} from "../../hook/CustomHooks";
import BackgroundPortal from "../common/BackgroundPortal";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import Profile from "../profile/Profile";

const SideBar = () => {
  const { user } = useAuth();
  const { reFetch } = useFetchProfile();
  const [open, setOpen] = useState(false);

  const openProfile = () => {
    reFetch();
    setOpen(true);
  };

  // Event listener
  const closeProfile = useCallback((e) => {
    if (
      e.keyCode === 27 ||
      Array.from(e.target.classList).some(
        (item) => item === "profile-container",
      )
    )
      setOpen(false);
  }, []);
  useEventListener("keydown", closeProfile);
  useEventListener("click", closeProfile);

  return (
    <section className="w-full max-w-[7%] shrink-0 bg-[var(--bg-color)]">
      {user ? (
        <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
          <ImageWithLightBoxWithBorderAndShadow
            src={user?.Avatar ?? ""}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            onClick={openProfile}
          />
          <BackgroundPortal
            open={open}
            title="Edit Profile"
            onClose={() => setOpen(false)}
          >
            <Profile onClose={() => setOpen(false)} />
          </BackgroundPortal>
          <div
            onClick={openProfile}
            className="fa fa-cog cursor-pointer text-xl font-thin"
          ></div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default SideBar;
