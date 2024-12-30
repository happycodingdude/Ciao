import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBox = (props) => {
  console.log("ImageWithLightBox calling...");
  const {
    src,
    // title,
    className,
    // spinnerClassName,
    imageClassName,
    roundedClassName,
    slides,
    index,
    onClick,
    // loaded,
  } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <div
      className={`${className} ${roundedClassName ?? "rounded-2xl"} relative flex h-full w-full cursor-pointer items-center justify-center bg-[var(--bg-color-extrathin)]`}
      onClick={onClick ?? handleShowLightbox}
    >
      {/* <LocalLoading
        className={`${roundedClassName ?? "rounded-2xl"} p-[1rem]`}
      /> */}

      <div
        className={`${roundedClassName ?? "rounded-2xl"} loading absolute z-[10] h-full w-full bg-[var(--loading-bg-color)] transition-opacity duration-[2000ms]`}
      ></div>
      {/* <div className="lazy-image h-full w-full bg-red-500"></div> */}

      <div
        data-src={src ?? "src/assets/imagenotfound.jpg"}
        className={`${imageClassName} 
        ${roundedClassName ?? "rounded-2xl"} 
        
        lazy-image absolute h-full w-full bg-[position:center_center] bg-no-repeat`}
      ></div>

      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </div>
  );
};

export default ImageWithLightBox;
