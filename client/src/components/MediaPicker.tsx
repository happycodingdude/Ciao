import React from "react";
import { MediaPickerProps } from "../types";

const MediaPicker = (props: MediaPickerProps) => {
  const { className, multiple, accept, id, onChange } = props;
  return (
    <>
      <input
        multiple={multiple}
        type="file"
        accept={accept}
        className="hidden"
        id={id}
        onChange={onChange}
      ></input>
      <label
        htmlFor={id}
        className={`${className ?? ""} fa fa-camera aspect-square cursor-pointer rounded-[50%] text-[var(--main-color)] hover:text-[var(--main-color-light)]`}
      ></label>
    </>
  );
};

export default MediaPicker;
