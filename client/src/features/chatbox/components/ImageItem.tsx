import React, { memo } from "react";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import "../../../imageitem.css";

type ImageItemProps = {
  file: File;
  onClick: (fileName: string) => void;
};

const ImageItem = memo(
  (props: ImageItemProps) => {
    const { file, onClick } = props;

    return (
      // <div
      //   className="relative flex aspect-square shrink-0 flex-col items-center justify-between gap-[1rem]
      //         rounded-[.5rem] bg-[var(--bg-color-thin)] p-3 phone:w-[10rem] laptop:w-[10rem]"
      // >
      //   <div className="absolute right-[-.5rem] top-[-.5rem] flex h-[3rem]">
      //     <div
      //       data-key={file.name}
      //       className="fa fa-trash cursor-pointer text-[var(--danger-text-color)] phone:text-lg laptop:text-md"
      //       onClick={onClick}
      //     ></div>
      //   </div>
      //   <ImageWithLightBoxAndNoLazy
      //     src={URL.createObjectURL(file)}
      //     className={`loaded aspect-square w-full cursor-pointer`}
      //     // imageClassName="bg-[size:150%]"
      //     slides={[
      //       {
      //         src: URL.createObjectURL(file),
      //       },
      //     ]}
      //     local
      //   />
      //   <p className="self-start text-xs">{file.name}</p>
      // </div>
      <div
        className="file-card border-chat-gray group relative w-24 flex-shrink-0 rounded-xl border bg-white p-3
      "
      >
        <div
          data-key={file.name}
          className="delete-btn absolute -right-2 -top-2 z-10 
          flex aspect-square w-[1.5rem] cursor-pointer items-center 
          justify-center rounded-full bg-red-400 text-xs text-white"
          onClick={() => onClick(file.name)}
        >
          <i className="fa-solid fa-times"></i>
        </div>
        {/* <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
          <i className="fa-solid fa-image text-xl text-blue-500"></i>
        </div> */}
        <ImageWithLightBoxAndNoLazy
          src={URL.createObjectURL(file)}
          className={`loaded mb-[1rem] aspect-square w-full cursor-pointer`}
          // imageClassName="bg-[size:150%]"
          slides={[
            {
              src: URL.createObjectURL(file),
            },
          ]}
          local
        />
        <p className="truncate text-xs font-medium text-gray-600">
          {file.name}
        </p>
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
