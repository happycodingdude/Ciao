import { OnlineStatusDotProps } from "../types";

const OnlineStatusDot = (props: OnlineStatusDotProps) => {
  const { online, className } = props;

  return (
    <div
      className={`${className ?? ""} absolute aspect-square w-3 rounded-[50%] 
      ${online ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
    ></div>
  );
};

export default OnlineStatusDot;
