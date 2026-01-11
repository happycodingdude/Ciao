import { CSSProperties, useState } from "react";
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

  return (
    <>
      <div
        title={title}
        style={
          {
            "--image-url": `url(${src && src !== "" && isValid ? src : "/src/assets/imagenotfound.jpg"})`,
          } as CSSProperties
        }
        className={`${className ?? ""} ${imageClassName ?? "bg-cover"} ${circle ? "rounded-full" : "rounded-2xl"} ${pending ? "opacity-50" : ""}
        bg-(image:--image-url) bg-position-[center_center] cursor-pointer bg-no-repeat transition-opacity duration-300`}
        onClick={onClick ?? handleShowLightbox}
      ></div>
      <img hidden src={src} onError={() => setIsValid(false)} />
      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
};

export default ImageWithLightBoxAndNoLazy;
