import React from "react";

const MediaPicker = ({ className, multiple, accept, id, onChange }) => {
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
        for={id}
        className={`${className ?? ""} fa fa-camera aspect-square cursor-pointer rounded-[50%] text-[var(--main-color)] hover:text-[var(--main-color-light)]`}
      ></label>
    </>
  );
};

export default MediaPicker;
