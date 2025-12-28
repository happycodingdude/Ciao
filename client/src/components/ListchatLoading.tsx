import "../listchat.css";

const ListchatLoading = () => {
  const numberOfLoadingDiv = 7;
  return (
    <div className="flex h-full w-full grow flex-col px-4">
      {Array.from({ length: numberOfLoadingDiv }).map((_, index) => (
        <div
          className="flex flex-1 animate-wave-ripple items-center border-b border-gray-100 p-3"
          style={{ animationDelay: "0s" }}
        >
          {/* MARK: Avatar */}
          <div className="wave-line shimmer-effect aspect-square w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
          {/* MARK: Content */}
          <div className="ml-3 flex-1">
            <div className="wave-line shimmer-effect mb-2 h-4 w-35 rounded-sm bg-gray-200 bg-opacity-40"></div>
            <div className="wave-line shimmer-effect h-3 w-40 rounded-sm bg-gray-200 bg-opacity-40"></div>
          </div>
          {/* MARK: Time */}
          <div className="w-10 text-xs text-gray-400 ">
            <div className="wave-line shimmer-effect w-6 aspect-square rounded-full bg-gray-200 bg-opacity-40"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListchatLoading;
