import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxImgTag = (props) => {
  // console.log("ImageWithLightBoxAndNoLazy calling...");
  const { src, title, className, slides, index, onClick, width, height } =
    props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <img
        src={src}
        title={title}
        className={`${className} cursor-pointer object-contain`}
        onClick={onClick ?? handleShowLightbox}
        width={width}
        height={height}
        loading="lazy"
      ></img>
      {/* <div
        title={title}
        style={{
          "--image-url": `url(${src && src !== "" ? src : "src/assets/imagenotfound.jpg"})`,
        }}
        className={`${className} cursor-pointer rounded-2xl bg-[image:var(--image-url)] bg-[position:center_center] bg-no-repeat transition-opacity duration-1000`}
        onClick={onClick ?? handleShowLightbox}
      ></div> */}
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBoxImgTag;
