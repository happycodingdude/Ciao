import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hook/CustomHooks";
import BackgroundPortal from "../common/BackgroundPortal";
import ImageWithLightBoxWithBorderAndShadow from "../common/ImageWithLightBoxWithBorderAndShadow";
import Profile from "../profile/Profile";

const SideBar = () => {
  const auth = useAuth();
  const [open, setOpen] = useState(false);

  // The close listener
  const closeProfile = useCallback((e) => {
    if (
      e.keyCode === 27 ||
      Array.from(e.target.classList).some(
        (item) => item === "profile-container",
      )
    )
      setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", closeProfile, true);
    window.addEventListener("click", closeProfile, true);
    return () => {
      window.addEventListener("keydown", closeProfile, true);
      window.addEventListener("click", closeProfile, true);
    };
  }, [closeProfile]);

  return (
    <section className="max-w-[7%] shrink-0 bg-white">
      {auth.id ? (
        <div className="flex h-full flex-col items-center justify-between px-[1rem] py-[2rem]">
          {/* <div className="flex w-full flex-col justify-center gap-[1rem]">
            <div className="relative"> */}
          <ImageWithLightBoxWithBorderAndShadow
            src={auth.user?.Avatar ?? ""}
            className="aspect-square w-[80%] cursor-pointer rounded-[50%]"
            slides={[
              {
                src: auth.user?.Avatar ?? "",
              },
            ]}
            onClick={() => setOpen(true)}
          />
          <BackgroundPortal
            open={open}
            title="Edit Profile"
            onClose={() => setOpen(false)}
          >
            <Profile />
          </BackgroundPortal>
          {/* </div> */}
          {/* <CustomLabel
              className="w-full font-medium text-gray-600"
              title={auth.user?.Name}
            ></CustomLabel> */}
          {/* </div> */}
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
