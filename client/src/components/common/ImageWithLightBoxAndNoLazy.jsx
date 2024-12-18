import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxAndNoLazy = (props) => {
  console.log("ImageWithLightBoxAndNoLazy calling...");
  const { src, title, className, slides, index, onClick } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <div
        title={title}
        style={{
          "--image-url": `url(${src && src !== "" ? src : "images/imagenotfound.jpg"})`,
        }}
        className={`${className} nolazy-image cursor-pointer rounded-2xl bg-[image:var(--image-url)] bg-[size:100%] bg-[position:center_center] bg-no-repeat transition-opacity duration-1000`}
        onClick={onClick ?? handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBoxAndNoLazy;
