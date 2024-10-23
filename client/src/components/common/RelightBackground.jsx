const RelightBackground = ({ children, lighten, className, ...props }) => {
  return (
    <div
      {...props}
      className={`${className} ${lighten ? "[&>*]:shadow-[0_0_30px_15px_var(--main-color-light)]" : "[&>*]:hover:shadow-[0_0_20px_12px_var(--main-color-light)]"} flex aspect-square cursor-pointer items-center justify-center [&>*]:h-0 [&>*]:w-0 [&>*]:transition-all [&>*]:duration-500`}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
