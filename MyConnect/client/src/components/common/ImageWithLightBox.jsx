import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

function ImageWithLightBox({ src, title, className, slides, index, onClick }) {
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
        className={`${className} `}
        onClick={onClick ?? handleShowLightbox}
        onError={imageOnError}
      ></img>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
}

export default ImageWithLightBox;
