import useAuthenticationFormToggles from "../features/authentication/hooks/useAuthenticationFormToggles";
import ForgotPassword from "../pages/ForgotPassword";
import Signin from "../pages/Signin";
import { isPhoneScreen } from "../utils/getScreenSize";

const SigninContainer = () => {
  const { toggle } = useAuthenticationFormToggles();

  return (
    <div
      data-state={toggle === "signin" || toggle === "forgot"}
      className={`absolute right-0 flex h-full flex-col items-center justify-center overflow-hidden transition-all duration-500
      data-[state=false]:translate-x-[700%] data-[state=true]:translate-x-0
      ${isPhoneScreen() ? "w-full" : "w-[40%]"}`}
    >
      <div className="relative w-[70%]">
        <Signin />
        <ForgotPassword />
      </div>
    </div>
  );
};

export default SigninContainer;
