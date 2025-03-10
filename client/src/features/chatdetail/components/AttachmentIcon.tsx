import React from "react";

type AttachmentIcon = {
  onClick: () => void;
  toggle: boolean;
};

const AttachmentIcon = (props: AttachmentIcon) => {
  const { onClick, toggle } = props;
  return (
    <svg
      onClick={onClick}
      width="100%"
      height="100%"
      viewBox="0 0 197.696 197.696"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlSpace="preserve"
      className="transition-all duration-200 hover:fill-[var(--main-color-bold)] phone:w-[1.7rem]"
    >
      <g>
        <path
          stroke="black"
          // stroke-width="2"
          className={toggle ? "active" : ""}
          d="M179.546,73.358L73.111,179.783c-13.095,13.095-34.4,13.095-47.481,0.007
c-13.095-13.095-13.095-34.396,0-47.495l13.725-13.739l92.696-92.689l11.166-11.159c8.829-8.833,23.195-8.833,32.038,0
c8.829,8.836,8.829,23.209,0,32.041L145.79,76.221l-74.383,74.383l-1.714,1.714c-4.42,4.413-11.606,4.42-16.026,0
c-4.42-4.413-4.42-11.599,0-16.019l76.101-76.097c1.582-1.578,1.582-4.141,0-5.723c-1.585-1.582-4.134-1.582-5.723,0
l-76.097,76.101c-7.58,7.573-7.58,19.895,0,27.464c7.566,7.573,19.884,7.566,27.464,0l1.714-1.714l74.383-74.383l29.465-29.472
c11.989-11.989,12-31.494,0-43.487c-11.986-11.986-31.49-11.986-43.487,0l-11.152,11.159L33.64,112.84l-13.725,13.732
c-16.252,16.244-16.252,42.685,0,58.937c16.241,16.252,42.678,16.248,58.929,0L185.265,79.081c1.585-1.578,1.585-4.137,0-5.719
C183.68,71.777,181.131,71.777,179.546,73.358z"
        />
      </g>
    </svg>
  );
};

export default AttachmentIcon;
