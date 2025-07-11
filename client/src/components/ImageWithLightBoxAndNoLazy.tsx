import React, { CSSProperties, useState } from "react";
import { ImageWithLightboxProps } from "../types";
import CustomLightbox from "./CustomLightbox";

const ImageWithLightBoxAndNoLazy = (props: ImageWithLightboxProps) => {
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
    local,
  } = props;

  const [showLightbox, setShowLightbox] = useState(false);
  const handleShowLightbox = () => setShowLightbox(true);

  const [isValid, setIsValid] = useState<boolean | null>(true);
  // useEffect(() => {
  //   if (local) {
  //     setIsValid(true);
  //     return;
  //   }
  //   const checkImage = async () => {
  //     const valid = await isValidUrl(src);
  //     setIsValid(valid);
  //   };
  //   checkImage();
  // }, [src, local]);

  return (
    <>
      <div
        title={title}
        style={
          {
            "--image-url": `url(${src && src !== "" && isValid ? src : "src/assets/imagenotfound.jpg"})`,
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
