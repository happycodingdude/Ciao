import { RelightBackgroundProps } from "../types";

const RelightBackground = (props: RelightBackgroundProps) => {
  const {
    children,
    lighten,
    className,
    onClick,
    paddingClassName,
    ...restProps
  } = props;
  return (
    <div
      {...restProps}
      className={`${className ?? ""} hover:bg-(--light-blue-500) hover:text-(--sub-color) flex aspect-square cursor-pointer items-center 
      justify-center rounded-2xl transition-all duration-200
      ${paddingClassName ?? "p-4"}
      ${lighten ? "bg-(--main-color) text-(--sub-color)" : "bg-(--light-blue-300)"}`}
      onClick={onClick ?? (() => {})}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
