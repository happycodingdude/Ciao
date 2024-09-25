import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

function ImageWithLightBox({ src, title, className, slides, index, onClick }) {
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
        className={`${className} `}
        onClick={onClick ?? handleShowLightbox}
        onError={imageOnError}
      ></img> */}
      <div
        style={{
          // "--image-url": `url(${src ? src : "images/imagenotfound.jpg"})`,
          "--image-url": `url(${src ?? "images/imagenotfound.jpg"})`,
          // "--image-url": `url("images/imagenotfound.jpg")`,
        }}
        className={`${className} bg-[image:var(--image-url)] bg-[size:150%] bg-[position:center_center] bg-no-repeat`}
        onClick={onClick ?? handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
}

export default ImageWithLightBox;
