import "../sidebar.css";
import { isPhoneScreen } from "../utils/getScreenSize";
import SideBarMenu from "./SideBarMenu";
import SideBarMenu_Mobile from "./SideBarMenu_Mobile";

const SideBar = () => {
  return (
    <section className="sidebar-container">
      {isPhoneScreen() ? <SideBarMenu_Mobile /> : <SideBarMenu />}
    </section>
  );
};

export default SideBar;
