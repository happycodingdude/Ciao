import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBox = (props) => {
  console.log("ImageWithLightBox calling...");
  const {
    src,
    title,
    className,
    spinnerClassName,
    imageClassName,
    slides,
    index,
    onClick,
    immediate,
  } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <div
      className={`${className} cursor-pointer`}
      onClick={onClick ?? handleShowLightbox}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center rounded-2xl bg-[var(--bg-color-extrathin)]`}
      >
        {/* <div
        title={title}
        data-src={src ?? "images/imagenotfound.jpg"}
        style={{
          "--image-url": `url(${src ?? "images/imagenotfound.jpg"})`,
        }}        
        className={`${className} lazy-image blurred bg-[position:center_center] bg-no-repeat transition-opacity duration-1000`}
        onClick={onClick ?? handleShowLightbox}
      ></div> */}

        <div className="absolute h-full w-full"></div>
        <div
          className={`${spinnerClassName} spinner-image absolute
        h-1/2 w-1/2 bg-[url('images/svg-spinners--bars-rotate-fade.svg')] bg-[position:center_center] bg-no-repeat`}
        ></div>

        <div
          // className={`${className} bg-[url('images/svg-spinners--bars-rotate-fade.svg')] bg-[position:center_center] bg-no-repeat`}
          data-src={src ?? "images/imagenotfound.jpg"}
          className={`${imageClassName} lazy-image absolute h-full w-full rounded-2xl bg-[position:center_center] bg-no-repeat`}
        >
          {/* <img
          src="images/svg-spinners--bars-rotate-fade.svg"
          title={title}
          data-src={src}
          loading="lazy"
          className="h-full w-full rounded-2xl"
        ></img> */}
          {/* <div
          data-src={src}
          className="lazy-background h-full w-full rounded-2xl"
        ></div> */}
        </div>

        <CustomLightbox
          reference={{ showLightbox, slides, index, setShowLightbox }}
        />
      </div>
    </div>
  );
};

export default ImageWithLightBox;
