import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

function ImageWithLightBoxWithBorderAndShadow({
  src,
  title,
  className,
  slides,
  index,
  onClick,
}) {
  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  const imageOnError = (e) => {
    e.target.onerror = null;
    e.target.src = "../src/assets/imagenotfound.jpg";
  };
  return (
    <>
      <img
        src={src}
        title={title}
        className={`${className} border-l-[.2rem] border-r-[.2rem] border-t-[.2rem] border-[var(--main-color-normal)] p-1 
        shadow-[0px_10px_20px_-7px_var(--shadow-color)]`}
        onClick={onClick ?? handleShowLightbox}
        onError={imageOnError}
      ></img>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      ></CustomLightbox>
    </>
  );
}

export default ImageWithLightBoxWithBorderAndShadow;
