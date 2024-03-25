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

  // const imageOnError = (e) => {
  //   e.target.onerror = null;
  //   e.target.src = "images/imagenotfound.jpg";
  // };

  return (
    <>
      {/* <img
        src={src}
        title={title}
        className={`${className} border-l-[.2rem] border-r-[.2rem] border-t-[.2rem] border-[var(--main-color-normal)] p-1 shadow-[0px_10px_20px_-7px_var(--shadow-color)]`}
        onClick={onClick ?? handleShowLightbox}
        onError={imageOnError}
      ></img> */}
      <div
        style={{
          "--image-url": `url(${src ? src : "images/imagenotfound.jpg"})`,
        }}
        className={`${className} border-l-[.2rem] border-r-[.2rem] border-t-[.2rem] border-[var(--main-color-normal)] bg-[image:var(--image-url)] bg-[size:160%]
        bg-[position:center_center] bg-no-repeat p-1 shadow-[0px_10px_20px_-7px_var(--shadow-color)] `}
        onClick={onClick ?? handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
}

export default ImageWithLightBoxWithBorderAndShadow;
