import { MediaPickerProps } from "../../types/base.types";

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
        className={`${className ?? ""} fa fa-camera aspect-square cursor-pointer rounded-[50%] text-light-blue-500 hover:text-light-blue-400`}
      ></label>
    </>
  );
};

export default MediaPicker;
