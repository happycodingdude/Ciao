const RelightBackground = ({
  children,
  lighten,
  className,
  onClick,
  ...props
}) => {
  return (
    <div
      {...props}
      className={`${className}
      ${lighten ? "rounded-[1rem] bg-[var(--main-color-bold)]" : "rounded-[50%] bg-[var(--bg-color-extrathin)]"}
      flex aspect-square cursor-pointer items-center
      justify-center p-[1rem] text-[var(--text-main-color)]
      transition-all duration-200 hover:rounded-[1rem]
      hover:bg-[var(--main-color-bold)]`}
      // className={`${className}
      // ${lighten ? "rounded-[1rem] bg-[var(--main-color-light)] text-[var(--text-sub-color)]" : "rounded-[50%] bg-[var(--bg-color-extrathin)] text-[var(--text-main-color)]"}
      // flex aspect-square cursor-pointer items-center
      // justify-center p-[1rem]
      // transition-all duration-200 hover:rounded-[1rem]
      // hover:bg-[var(--main-color-light)]`}

      onClick={onClick ?? (() => {})}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
