const LocalLoading = (props) => {
  const { className } = props;
  return (
    <div
      className={`${className ?? ""} loading absolute z-[10] flex h-full w-full items-center justify-center 
      bg-[var(--loading-color)] transition-opacity duration-[2000ms]`}
    >
      {/* <div className="loader">
        <svg className="circular" viewBox="25 25 50 50">
          <circle
            className="path"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke-width="2"
            stroke-miterlimit="10"
          />
        </svg>
      </div> */}
      <p className="text-2xl">Loading....</p>
    </div>
  );
};

export default LocalLoading;
