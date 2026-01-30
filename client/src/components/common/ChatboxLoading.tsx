import "../../styles/listchat.css";

const ChatboxLoading = () => {
  const numberOfLoadingDiv = 6;
  return (
    <div className="flex h-full w-full grow flex-col border-r border-gray-200 bg-primary-light">
      <div className="flex flex-1 flex-col bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-4 py-2">
          <div className="wave-line shimmer-effect aspect-square w-12 rounded-full bg-opacity-40"></div>
          <div className="ml-3">
            <div className="wave-line shimmer-effect mb-2 h-4 w-40 rounded-sm bg-opacity-40"></div>
            <div className="wave-line shimmer-effect h-3 w-32 rounded-sm bg-opacity-40"></div>
          </div>
          <div className="ml-auto flex space-x-3">
            <div className="wave-line shimmer-effect h-8 w-8 rounded-full bg-opacity-40"></div>
            <div className="wave-line shimmer-effect h-8 w-8 rounded-full bg-opacity-40"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {Array.from({ length: numberOfLoadingDiv }).map((_, index) =>
            index % 2 === 0 ? (
              <div
                className="mb-4 flex animate-wave-ripple"
                style={{ animationDelay: "0s" }}
              >
                <div className="wave-line shimmer-effect aspect-square h-12 rounded-full bg-opacity-40"></div>
                <div className="ml-2 max-w-[70%]">
                  <div className="wave-line shimmer-effect h-12 w-48 rounded-lg bg-opacity-40"></div>
                  <div className="wave-line shimmer-effect ml-1 mt-1 h-3 w-16 rounded-sm bg-opacity-40"></div>
                </div>
              </div>
            ) : (
              <div
                className="mb-4 flex animate-wave-ripple justify-end"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="mr-2 max-w-[70%]">
                  <div className="wave-line shimmer-effect h-12 w-48 rounded-lg bg-opacity-40"></div>
                  <div className="wave-line shimmer-effect ml-auto mt-1 h-3 w-16 rounded-sm bg-opacity-40"></div>
                </div>
              </div>
            ),
          )}

          <div
            className="flex h-24 animate-wave-ripple flex-col items-center justify-center"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="text-primary-DEFAULT wave-line mb-3 text-5xl opacity-30">
              <i className="fa-solid fa-message"></i>
            </div>
            <p className="text-sm text-gray-400">Messages will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatboxLoading;
