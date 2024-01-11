import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

function ImageWithLightBox({ src, title, className, slides }) {
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
        onClick={handleShowLightbox}
        onError={imageOnError}
        className={className}
      ></img>
      <CustomLightbox
        reference={{ showLightbox, slides, setShowLightbox }}
      ></CustomLightbox>
    </>
  );
}

export default ImageWithLightBox;
