import "../listchat.css";

const ModalLoading = (props) => {
  const { className } = props;
  const numberOfLoadingDiv = 5;
  return (
    <div className="absolute left-0 top-0 z-10 w-full h-full bg-white flex flex-col">
      <div className="border-b-[.1rem] border-[var(--border-color)] py-6 px-4">
        <div className="wave-line shimmer-effect h-6 w-[30%] rounded-full bg-gray-200 bg-opacity-40"></div>
      </div>
      <div className="border-b-[.1rem] border-[var(--border-color)] pt-[2rem] pb-[1rem] w-[70%] mx-auto">
        <div className="wave-line shimmer-effect h-6 w-[30%] rounded-full bg-gray-200 bg-opacity-40"></div>
      </div>
      <div id="sidebar-loading-3" className="flex h-full w-full grow flex-col">
        {Array.from({ length: numberOfLoadingDiv }).map((_, index) => (
          <div
            className="flex flex-1 animate-wave-ripple items-center border-b border-gray-100  p-3"
            style={{ animationDelay: "0s" }}
          >
            {/* MARK: Avatar */}
            <div className="wave-line shimmer-effect aspect-square w-[4rem] rounded-full bg-gray-200 bg-opacity-40"></div>
            {/* MARK: Content */}
            <div className="ml-3 flex-1">
              <div className="wave-line shimmer-effect mb-2 h-4 w-[10rem] rounded bg-gray-200 bg-opacity-40"></div>
            </div>
            {/* MARK: Time */}
            <div className="w-[2.5rem] text-xs text-gray-400">
              <div className="wave-line shimmer-effect h-3 rounded bg-gray-200 bg-opacity-40"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModalLoading;
