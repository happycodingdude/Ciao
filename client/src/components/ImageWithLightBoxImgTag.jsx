import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxImgTag = (props) => {
  console.log("ImageWithLightBoxAndNoLazy calling...");
  const { src, title, className, slides, index, onClick } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <img
        src={src}
        title={title}
        className={`${className} h-full w-full cursor-pointer rounded-xl object-contain`}
        onClick={onClick ?? handleShowLightbox}
      ></img>
      {/* <div
        title={title}
        style={{
          "--image-url": `url(${src && src !== "" ? src : "images/imagenotfound.jpg"})`,
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
