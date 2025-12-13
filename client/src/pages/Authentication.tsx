import { useRef } from "react";
import AuthenticationFormTogglesProvider from "../context/AuthenticationFormTogglesContext";
import useAuthenticationFormToggles from "../features/authentication/hooks/useAuthenticationFormToggles";
import useLocalStorage from "../hooks/useLocalStorage";
import SigninContainer from "../layouts/SigninContainer";
import { isPhoneScreen } from "../utils/getScreenSize";
import Signup from "./Signup";

export const AuthenticationContainer = () => {
  console.log("Rendering AuthenticationContainer");
  return (
    <AuthenticationFormTogglesProvider>
      <Authentication />
    </AuthenticationFormTogglesProvider>
  );
};

const Authentication = () => {
  // const { data: info } = useInfo(true);
  // const [accessToken] = useLocalStorage("accessToken");
  const [accessToken] = useLocalStorage("accessToken", "");
  // const navigate = useNavigate();
  const { setToggle } = useAuthenticationFormToggles();

  const refBgContainer = useRef<HTMLDivElement>();
  const refBgSignUpLabelContainer = useRef<HTMLDivElement>();
  const refBgSignInLabelContainer = useRef<HTMLDivElement>();
  const refSigninContainer = useRef<HTMLDivElement>();
  const refLoginWrapper = useRef<HTMLDivElement>();

  // const [showLogin, setShowLogin] = useState(true);
  // const [showSignup, setShowSignup] = useState(false);

  // if (info) redirect({ to: "/" });

  // if (accessToken) return <LocalLoading />;

  const toggleBg = () => {
    // Animate background container
    refBgContainer.current?.classList.toggle("left-[40%]");
    refBgContainer.current?.classList.toggle("rounded-br-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tr-[20rem]");
    refBgContainer.current?.classList.toggle("rounded-r-0");
    refBgContainer.current?.classList.toggle("rounded-bl-[10rem]");
    refBgContainer.current?.classList.toggle("rounded-tl-[20rem]");
    // Animate background text
    refBgSignUpLabelContainer.current?.classList.toggle("translate-x-[-200%]");
    refBgSignUpLabelContainer.current?.classList.toggle("opacity-0");
    refBgSignInLabelContainer.current?.classList.toggle("translate-x-[-100%]");
    refBgSignInLabelContainer.current?.classList.toggle("opacity-0");
    // Animate form
    refSigninContainer.current?.classList.toggle("opacity-0");
    refLoginWrapper.current?.classList.toggle("translate-x-[-100%]");
  };

  const toggleSignup = () => {
    toggleBg();
    setToggle("signup");
  };

  const toggleLogin = () => {
    toggleBg();
    setToggle("signin");
  };

  return (
    <div className="bg-(--bg-color) flex w-full flex-col tablet:text-[clamp(1rem,1.2vw,2rem)]">
      <section className="relative flex h-full w-full transition-all duration-500">
        {isPhoneScreen() ? (
          <>
            <SigninContainer />
            <Signup />
          </>
        ) : (
          <>
            <div
              ref={refBgContainer}
              className={`bg-position-[center_center] absolute left-0 z-10 h-full w-[60%] overflow-hidden rounded-br-[10rem] 
            rounded-tr-[20rem] bg-[url('src/assets/hoian10.png')] bg-cover bg-no-repeat transition-all duration-500
            before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0
            before:h-full before:w-full before:bg-[rgba(86,86,86,0.47)]`}
            ></div>

            {/* <AuthenticationFormTogglesProvider> */}
            <SigninContainer />
            <Signup />
            {/* </AuthenticationFormTogglesProvider> */}

            <div
              ref={refBgSignUpLabelContainer}
              className="absolute left-[10%] top-1/2 z-10 flex translate-y-[-50%] flex-col items-center gap-8 text-center 
            text-white transition-all duration-500"
            >
              <p className="text-7xl">Hello, friend</p>
              <div
                onClick={toggleSignup}
                className="cursor-pointer rounded-2xl border-[.2rem] border-white px-20 py-2 text-3xl 
              transition-all duration-500 hover:shadow-[0_3px_10px_white]"
              >
                Sign up
              </div>
            </div>
            <div
              ref={refBgSignInLabelContainer}
              className="absolute top-1/2 z-10 flex translate-y-[-50%] flex-col items-center gap-8 text-center text-white opacity-0 
            transition-all duration-500 tablet:right-[-35%] laptop:right-[-20%]"
            >
              <p className="text-7xl">Welcome back</p>
              <div
                onClick={toggleLogin}
                className="cursor-pointer rounded-2xl border-[.2rem] border-white px-20 py-2 text-2xl 
              transition-all duration-500 hover:shadow-[0_3px_10px_white]"
              >
                Sign in
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Authentication;
