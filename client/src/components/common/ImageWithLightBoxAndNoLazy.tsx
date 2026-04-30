import { CSSProperties, forwardRef, useState } from "react";
import { ImageWithLightboxProps } from "../../types/base.types";
import CustomLightbox from "./CustomLightbox";

// const ImageWithLightBoxAndNoLazy = (props: ImageWithLightboxProps) => {
//   const {
//     src,
//     title,
//     className,
//     imageClassName,
//     slides,
//     index,
//     onClick,
//     circle,
//     pending,
//     local,
//   } = props;

//   const [showLightbox, setShowLightbox] = useState(false);
//   const handleShowLightbox = () => setShowLightbox(true);
//   const [isValid, setIsValid] = useState<boolean | null>(true);

//   return (
//     <>
//       <div
//         title={title}
//         style={
//           {
//             "--image-url": `url(${src && src !== "" && isValid ? src : "/assets/imagenotfound.jpg"})`,
//           } as CSSProperties
//         }
//         className={`${className ?? ""} ${imageClassName ?? "bg-cover"} ${circle ? "rounded-full" : "rounded-2xl"} ${pending ? "opacity-50" : ""}
//         bg-(image:--image-url) bg-position-[center_center] cursor-pointer bg-no-repeat transition-opacity duration-300`}
//         onClick={onClick ?? handleShowLightbox}
//       ></div>
//       <img hidden src={src} onError={() => setIsValid(false)} />
//       <CustomLightbox
//         reference={{ showLightbox, slides, index, setShowLightbox }}
//       />
//     </>
//   );
// };

const ImageWithLightBoxAndNoLazy = forwardRef<
  HTMLDivElement,
  ImageWithLightboxProps
>((props, ref) => {
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
  const [isValid, setIsValid] = useState(true);

  const handleShowLightbox = () => setShowLightbox(true);

  // expose ref ra ngoài (nếu cần)
  const innerRef = (node: HTMLDivElement | null) => {
    if (!ref) return;
    if (typeof ref === "function") ref(node);
    else (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const backgroundImage =
    src && isValid ? `url(${src})` : `url(/assets/imagenotfound.jpg)`;

  return (
    <>
      <div
        ref={innerRef}
        title={title}
        style={
          {
            "--image-url": backgroundImage,
          } as CSSProperties
        }
        className={`${className ?? ""} ${imageClassName ?? "bg-cover"} ${
          circle ? "rounded-full" : "rounded-2xl"
        } ${pending ? "opacity-50" : ""}
          cursor-pointer bg-[image:var(--image-url)] bg-center bg-no-repeat transition-opacity duration-300`}
        onClick={onClick ?? handleShowLightbox}
      />

      {/* preload + detect error */}
      {src && (
        <img
          src={src}
          style={{ display: "none" }}
          onError={() => setIsValid(false)}
        />
      )}

      <CustomLightbox
        reference={{ showLightbox, slides, index, setShowLightbox }}
      />
    </>
  );
});

export default ImageWithLightBoxAndNoLazy;
