const RelightBackground = ({ children, lighten, className, ...props }) => {
  return (
    <div
      {...props}
      // className={`${className}
      // ${lighten ? "[&>*]:shadow-[0_0_30px_15px_var(--main-color-thin)]" : "[&>*]:hover:shadow-[0_0_20px_12px_var(--main-color-thin)]"}
      // flex aspect-square cursor-pointer items-center justify-center
      // bg-[var(--main-color-bold)] p-2 text-[var(--text-main-color)]
      // [&>*]:h-0 [&>*]:w-0 [&>*]:transition-all [&>*]:duration-500`}

      className={`${className} 
      ${lighten ? "rounded-[1rem] bg-[var(--main-color-bold)]" : "rounded-[50%] bg-[var(--bg-color-extrathin)]"} 
      flex aspect-square cursor-pointer items-center 
      justify-center p-[1rem] text-[var(--text-main-color)]
      transition-all duration-200 hover:rounded-[1rem]
      hover:bg-[var(--main-color-bold)] [&>*]:text-md`}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
