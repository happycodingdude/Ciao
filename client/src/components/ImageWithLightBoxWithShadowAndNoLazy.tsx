import React, { CSSProperties, useState } from "react";
import { ImageWithLightboxProps } from "../types";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxWithShadowAndNoLazy = (
  props: ImageWithLightboxProps,
) => {
  const { src, title, className, slides, index, onClick } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = (e) => setShowLightbox(true);

  return (
    <>
      <div
        title={title}
        style={
          {
            "--image-url": `url(${src && src !== "" ? src : "src/assets/imagenotfound.jpg"})`,
          } as CSSProperties
        }
        className={`${className} bg-[image:var(--image-url)] bg-[size:160%] bg-[position:center_center] bg-no-repeat shadow-[0_0_10px_-5px_var(--main-color)]
        transition-opacity duration-1000`}
        onClick={onClick ?? handleShowLightbox}
      ></div>
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBoxWithShadowAndNoLazy;
