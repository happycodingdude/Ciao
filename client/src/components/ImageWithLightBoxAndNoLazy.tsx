import React, { CSSProperties, useState } from "react";
import { ImageWithLightboxProps } from "../types";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxAndNoLazy = (props: ImageWithLightboxProps) => {
  // console.log("ImageWithLightBoxAndNoLazy calling...");
  const {
    src,
    title,
    className,
    imageClassName,
    slides,
    index,
    onClick,
    circle,
    pending,
  } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = () => setShowLightbox(true);

  return (
    <>
      <div
        title={title}
        style={
          {
            "--image-url": `url(${src && src !== "" ? src : "src/assets/imagenotfound.jpg"})`,
          } as CSSProperties
        }
        className={`${className ?? ""} ${imageClassName ?? "bg-[size:cover]"} ${circle ? "rounded-full" : "rounded-2xl"} ${pending ? "opacity-50" : ""}
        cursor-pointer bg-[image:var(--image-url)] bg-[position:center_center] bg-no-repeat transition-opacity duration-300`}
        onClick={onClick ?? handleShowLightbox}
        // onClick={handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBoxAndNoLazy;
