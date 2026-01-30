import { memo } from "react";
import "../../styles/imageitem.css";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type ImageItemProps = {
  file: File;
  onClick: (fileName: string) => void;
};

const ImageItem = memo(
  (props: ImageItemProps) => {
    const { file, onClick } = props;

    return (
      <div className="file-card group relative w-20 shrink-0 rounded-xl border border-chat-gray bg-white p-3">
        <div
          data-key={file.name}
          className="delete-btn absolute -right-2 -top-2 z-10 
          flex aspect-square w-5 cursor-pointer items-center 
          justify-center rounded-full bg-red-400 text-xs text-white"
          onClick={() => onClick(file.name)}
        >
          <i className="fa-solid fa-times"></i>
        </div>
        <ImageWithLightBoxAndNoLazy
          src={URL.createObjectURL(file)}
          className={`loaded mb-2 aspect-square w-full cursor-pointer`}
          slides={[
            {
              src: URL.createObjectURL(file),
            },
          ]}
          local
        />
        <p className="truncate text-gray-600">{file.name}</p>
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
