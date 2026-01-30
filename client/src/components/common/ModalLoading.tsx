import "../../styles/listchat.css";

const ModalLoading = (props) => {
  const { className } = props;
  const numberOfLoadingDiv = 5;
  return (
    <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col bg-white">
      <div className="border-(--border-color) border-b-[.1rem] px-4 py-6">
        <div className="wave-line shimmer-effect h-6 w-[30%] rounded-full bg-gray-200 bg-opacity-40"></div>
      </div>
      <div className="border-(--border-color) mx-auto w-[70%] border-b-[.1rem] pb-4 pt-8">
        <div className="wave-line shimmer-effect h-6 w-[30%] rounded-full bg-gray-200 bg-opacity-40"></div>
      </div>
      <div className="flex h-full w-full grow flex-col">
        {Array.from({ length: numberOfLoadingDiv }).map((_, index) => (
          <div
            className="flex flex-1 animate-wave-ripple items-center border-b border-gray-100  p-3"
            style={{ animationDelay: "0s" }}
          >
            {/* MARK: Avatar */}
            <div className="wave-line shimmer-effect aspect-square w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
            {/* MARK: Content */}
            <div className="ml-3 flex-1">
              <div className="wave-line shimmer-effect mb-2 h-4 w-40 rounded-sm bg-gray-200 bg-opacity-40"></div>
            </div>
            {/* MARK: Time */}
            <div className="w-10 text-xs text-gray-400">
              <div className="wave-line shimmer-effect h-3 rounded-sm bg-gray-200 bg-opacity-40"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModalLoading;
