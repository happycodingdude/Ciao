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
      className={`${className ?? ""} hover:bg-(--main-color) hover:text-(--sub-color) flex aspect-square cursor-pointer items-center 
      justify-center rounded-[1rem] transition-all duration-200
      ${paddingClassName ?? "p-[1rem]"}
      ${lighten ? "bg-(--main-color) text-(--sub-color)" : "bg-(--bg-color-thin)"}`}
      onClick={onClick ?? (() => {})}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
