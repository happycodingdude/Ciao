import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxAndNoLazy = (props) => {
  // console.log("ImageWithLightBoxAndNoLazy calling...");
  const {
    src,
    title,
    className,
    imageClassName,
    slides,
    index,
    // onClick,
    circle,
  } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <div
        title={title}
        style={{
          "--image-url": `url(${src && src !== "" ? src : "src/assets/imagenotfound.jpg"})`,
        }}
        className={`${className} ${imageClassName ?? "bg-[size:100%]"} ${circle ? "rounded-full" : "rounded-2xl"}  nolazy-image cursor-pointer  bg-[image:var(--image-url)]  bg-[position:center_center] bg-no-repeat transition-opacity duration-1000`}
        // onClick={onClick ?? handleShowLightbox}
        onClick={handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBoxAndNoLazy;
