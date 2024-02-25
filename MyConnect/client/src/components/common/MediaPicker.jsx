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
        className={`${className ?? ""} fa fa-camera aspect-square cursor-pointer rounded-[50%] bg-[var(--bg-color)] 
        text-[var(--main-color-normal)] hover:text-[var(--main-color)]`}
      ></label>
    </>
  );
};

export default MediaPicker;
