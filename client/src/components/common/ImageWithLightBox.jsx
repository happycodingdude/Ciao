import React, { useState } from "react";
import CustomLightbox from "./CustomLightbox";
import LocalLoading from "./LocalLoading";

const ImageWithLightBox = (props) => {
  console.log("ImageWithLightBox calling...");
  const {
    src,
    // title,
    className,
    // spinnerClassName,
    imageClassName,
    roundedClassName,
    slides,
    index,
    onClick,
  } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <div
      className={`${className} ${roundedClassName ?? "rounded-2xl"} relative flex h-full w-full cursor-pointer items-center justify-center bg-[var(--bg-color-extrathin)]`}
      onClick={onClick ?? handleShowLightbox}
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

      {/* <div
        className={`${spinnerClassName} ${roundedClassName ?? "rounded-2xl"} spinner-image absolute
        h-1/2 w-1/2 bg-[url('images/svg-spinners--bars-rotate-fade.svg')] bg-[position:center_center] bg-no-repeat`}
      ></div> */}
      <LocalLoading
        className={`${roundedClassName ?? "rounded-2xl"} p-[1rem]`}
      />

      <div
        // className={`${className} bg-[url('images/svg-spinners--bars-rotate-fade.svg')] bg-[position:center_center] bg-no-repeat`}
        data-src={src ?? "images/imagenotfound.jpg"}
        className={`${imageClassName} ${roundedClassName ?? "rounded-2xl"} lazy-image absolute h-full w-full bg-[position:center_center] bg-no-repeat`}
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
  );
};

export default ImageWithLightBox;
