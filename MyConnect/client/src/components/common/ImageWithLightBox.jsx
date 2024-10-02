import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

function ImageWithLightBox(props) {
  const { src, title, className, slides, index, onClick } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <div className="blurred-img">
        <img src={src} loading="lazy"></img>
      </div>
      {/* <div
        title={title}
        style={{
          "--image-url": `url(${src ?? "images/imagenotfound.jpg"})`,
        }}
        // data-src={src ?? "images/imagenotfound.jpg"}
        // className={`${className} bg-[image:var(--image-url)]  bg-[position:center_center] bg-no-repeat`}
        className={`${className} blurred-img  bg-[position:center_center] bg-no-repeat`}
        onClick={onClick ?? handleShowLightbox}
        onLoad={() => {
          console.log("image loading....");
        }}
      ></div> */}
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
}

export default ImageWithLightBox;
