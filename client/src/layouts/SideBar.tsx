import { SideBarProps } from "../types";
import { isPhoneScreen } from "../utils/getScreenSize";
import SideBarMenu from "./SideBarMenu";
import SideBarMenu_Mobile from "./SideBarMenu_Mobile";

const SideBar = (props: SideBarProps) => {
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
