import React, { memo } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";

const ImageItem = memo(
  (props) => {
    const { file, onClick } = props;

    return (
      <div
        className="relative flex aspect-square shrink-0 flex-col items-center justify-between gap-[1rem]
              rounded-[.5rem] bg-[var(--bg-color-thin)] p-3 phone:w-[10rem] laptop:w-[10rem]"
      >
        <div className="absolute right-[-.5rem] top-[-.5rem] flex h-[3rem]">
          <div
            data-key={file.name}
            className="fa fa-trash cursor-pointer text-[var(--danger-text-color)] phone:text-lg laptop:text-md"
            onClick={onClick}
          ></div>
        </div>
        <ImageWithLightBoxAndNoLazy
          src={URL.createObjectURL(file)}
          className={`loaded aspect-square w-full cursor-pointer`}
          // imageClassName="bg-[size:150%]"
          slides={[
            {
              src: URL.createObjectURL(file),
            },
          ]}
        />
        <p className="self-start text-xs">{file.name}</p>
      </div>
    );
  },
  // Adjust comparison to omit `ref` and compare the rest of the props
  (prevProps, nextProps) => {
    const { ...prevRest } = prevProps;
    const { ...nextRest } = nextProps;

    // Compare only relevant props, ignoring `ref`
    return prevRest.file === nextRest.file;
  },
);

export default ImageItem;
