import "../listchat.css";

const ChatboxLoading = (props) => {
  const { className } = props;
  const numberOfLoadingDiv = 10;
  return (
    <div
      id="sidebar-loading-3"
      className="flex h-full w-full grow flex-col border-r border-gray-200 bg-primary-light"
    >
      <div
        id="chat-content-loading-3"
        className="flex flex-1 flex-col bg-white"
      >
        <div className="flex items-center border-b border-gray-200 p-4">
          <div className="wave-line shimmer-effect aspect-square w-[4rem] rounded-full bg-opacity-40"></div>
          <div className="ml-3">
            <div className="wave-line shimmer-effect mb-2 h-4 w-[10rem] rounded bg-opacity-40"></div>
            <div className="wave-line shimmer-effect h-3 w-[8rem] rounded bg-opacity-40"></div>
          </div>
          <div className="ml-auto flex space-x-3">
            <div className="wave-line shimmer-effect h-8 w-8 rounded-full bg-opacity-40"></div>
            <div className="wave-line shimmer-effect h-8 w-8 rounded-full bg-opacity-40"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-[3rem]">
          {Array.from({ length: numberOfLoadingDiv }).map((_, index) =>
            index % 2 === 0 ? (
              <div
                className="mb-4 flex animate-wave-ripple"
                style={{ animationDelay: "0s" }}
              >
                <div className="wave-line shimmer-effect h-[4rem] w-[4rem] rounded-full bg-opacity-40"></div>
                <div className="ml-2 max-w-[70%]">
                  <div className="wave-line shimmer-effect h-16 w-64 rounded-lg bg-opacity-40"></div>
                  <div className="wave-line shimmer-effect ml-1 mt-1 h-3 w-16 rounded bg-opacity-40"></div>
                </div>
              </div>
            ) : (
              <div
                className="mb-4 flex animate-wave-ripple justify-end"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="mr-2 max-w-[70%]">
                  <div className="wave-line shimmer-effect h-12 w-48 rounded-lg bg-opacity-40"></div>
                  <div className="wave-line shimmer-effect ml-auto mt-1 h-3 w-16 rounded bg-opacity-40"></div>
                </div>
              </div>
            ),
          )}

          <div
            className="flex h-32 animate-wave-ripple flex-col items-center justify-center"
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
