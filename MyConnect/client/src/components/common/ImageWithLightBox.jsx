import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBox = (props) => {
  console.log("ImageWithLightBox calling...");
  const { src, title, className, slides, index, onClick } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <div
        title={title}
        data-src={src ?? "images/imagenotfound.jpg"}
        className={`${className} lazy-background blurred bg-[position:center_center] bg-no-repeat transition-opacity duration-1000`}
        onClick={onClick ?? handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBox;
