import ForgotPasswordForm from "../features/authentication/components/ForgotPasswordForm";
import useAuthenticationFormToggles from "../hooks/useAuthenticationFormToggles";

const ForgotPassword = () => {
  const { toggle } = useAuthenticationFormToggles();
  return (
    <div
      data-state={toggle === "forgot"}
      className="bg-(--bg-color-bold) m-auto flex h-full flex-col justify-center gap-20 duration-500 
        data-[state=false]:translate-y-0 data-[state=true]:-translate-y-full"
    >
      <p className="text-(--text-main-color) text-3xl">Reset password</p>

      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
