import React, { useEffect } from "react";
import useInfo from "../features/authentication/hooks/useInfo";
import { SideBarProps } from "../types";
import blurImage from "../utils/blurImage";
import { isPhoneScreen } from "../utils/getScreenSize";
import SideBarMenu from "./SideBarMenu";
import SideBarMenu_Mobile from "./SideBarMenu_Mobile";

const SideBar = (props: SideBarProps) => {
  const { data: info } = useInfo();

  if (!info) return;

  useEffect(() => {
    blurImage(".sidebar-container");
  }, [info.avatar]);

  return (
    <section className="sidebar-container">
      {isPhoneScreen() ? (
        <SideBarMenu_Mobile {...props} />
      ) : (
        <SideBarMenu {...props} />
      )}
    </section>
  );
};

export default SideBar;
