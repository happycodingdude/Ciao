import React from "react";
import ImageWithLightBox from "./ImageWithLightBox";

const ImageWithLightBoxWithBorderAndShadow = (props) => {
  console.log("ImageWithLightBoxWithBorderAndShadow calling...");
  const { src, title, className, slides, index, onClick, immediate } = props;

  return (
    <ImageWithLightBox
      src={src}
      title={title}
      className={`${className} border-l-[.2rem] border-r-[.2rem] border-t-[.2rem] border-[var(--main-color-normal)]
        bg-[size:160%] bg-[position:center_center] bg-no-repeat p-1 shadow-[0px_10px_20px_-7px_var(--shadow-color)]`}
      slides={slides}
      index={index}
      immediate={immediate}
      onClick={onClick}
    />
  );
};

export default ImageWithLightBoxWithBorderAndShadow;
