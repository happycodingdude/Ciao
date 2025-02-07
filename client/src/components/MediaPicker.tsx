import React, { ChangeEventHandler } from "react";

export type MediaPickerProps = {
  className?: string;
  multiple?: boolean;
  accept?: string;
  id?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const MediaPicker = ({
  className,
  multiple,
  accept,
  id,
  onChange,
}: MediaPickerProps) => {
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
