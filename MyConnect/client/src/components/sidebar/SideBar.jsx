import React, { useCallback, useState } from "react";
import { useAuth, useEventListener } from "../../hook/CustomHooks";
import BackgroundPortal from "../common/BackgroundPortal";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import Profile from "../profile/Profile";

const SideBar = () => {
  const auth = useAuth();
  const [open, setOpen] = useState(false);

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
    <section className="max-w-[7%] shrink-0 bg-white">
      {auth.id ? (
        <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
          <ImageWithLightBoxWithBorderAndShadow
            src={auth.user?.Avatar ?? ""}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            onClick={() => setOpen(true)}
          />
          <BackgroundPortal
            open={open}
            title="Edit Profile"
            onClose={() => setOpen(false)}
          >
            <Profile />
          </BackgroundPortal>
          <div
            onClick={() => setOpen(true)}
            className="fa fa-cog cursor-pointer text-xl font-thin text-gray-500"
          ></div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default SideBar;
