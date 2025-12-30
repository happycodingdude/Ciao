import SigninForm from "../features/authentication/components/SigninForm";
import useAuthenticationFormToggles from "../features/authentication/hooks/useAuthenticationFormToggles";

const Signin = () => {
  const { toggle } = useAuthenticationFormToggles();
  return (
    <div
      data-state={toggle === "signin" || toggle === "signup"}
      className="m-auto flex h-full flex-col justify-center gap-20 duration-500 
      data-[state=false]:-translate-y-full data-[state=true]:translate-y-0"
    >
      <p className="text-(--text-main-color) text-3xl">Sign in</p>
      <SigninForm />
    </div>
  );
};

export default Signin;
