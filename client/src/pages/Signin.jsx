import SigninForm from "../features/authentication/components/SigninForm";

const Signin = (props) => {
  console.log("Signin calling");
  const { show, showContainer, toggle } = props;

  return (
    <div
      data-state={show}
      className="m-auto flex h-full w-[70%] flex-col justify-center gap-[5rem] duration-500 
      data-[state=false]:translate-y-[-100%] data-[state=true]:translate-y-0"
    >
      <p className="text-5xl text-[var(--text-main-color)]">Sign in</p>

      <SigninForm show={show} showContainer={showContainer} toggle={toggle} />
    </div>
  );
};

export default Signin;
