import { SideBarProps } from "../types";
import { isPhoneScreen } from "../utils/getScreenSize";
import SideBarMenu from "./SideBarMenu";
import SideBarMenu_Mobile from "./SideBarMenu_Mobile";

const SideBar = (props: SideBarProps) => {
  // const { data: info } = useInfo();
  // const { data: conversations } = useConversation();

  // useEffect(() => {
  //   blurImage(".sidebar-container");
  // }, [info.avatar]);

  // if (!info || (isPhoneScreen() && conversations?.selected)) return;

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
