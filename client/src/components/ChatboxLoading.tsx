import "../listchat.css";

const ChatboxLoading = (props) => {
  const { className } = props;
  return (
    <div
      id="sidebar-loading-3"
      className="bg-primary-light flex h-full w-full grow flex-col border-r border-gray-200"
    >
      <div
        id="chat-content-loading-3"
        className="flex flex-1 flex-col bg-white"
      >
        <div className="flex items-center border-b border-gray-200 p-4">
          <div className="wave-line h-10 w-10 rounded-full bg-gray-200 bg-opacity-40"></div>
          <div className="ml-3">
            <div className="wave-line mb-1 h-4 w-32 rounded bg-gray-200 bg-opacity-40"></div>
            <div className="wave-line h-3 w-24 rounded bg-gray-200 bg-opacity-40"></div>
          </div>
          <div className="ml-auto flex space-x-3">
            <div className="wave-line h-8 w-8 rounded-full bg-gray-200 bg-opacity-40"></div>
            <div className="wave-line h-8 w-8 rounded-full bg-gray-200 bg-opacity-40"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div
            className="animate-wave-ripple mb-4 flex"
            style={{ animationDelay: "0s" }}
          >
            <div className="wave-line h-8 w-8 rounded-full bg-gray-200 bg-opacity-40"></div>
            <div className="ml-2 max-w-[70%]">
              <div className="wave-line h-16 w-64 rounded-lg bg-gray-200 bg-opacity-40"></div>
              <div className="wave-line ml-1 mt-1 h-3 w-16 rounded bg-gray-200 bg-opacity-40"></div>
            </div>
          </div>

          <div
            className="animate-wave-ripple mb-4 flex justify-end"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="mr-2 max-w-[70%]">
              <div className="wave-line h-12 w-48 rounded-lg bg-gray-200 bg-opacity-40"></div>
              <div className="wave-line ml-auto mt-1 h-3 w-16 rounded bg-gray-200 bg-opacity-40"></div>
            </div>
          </div>

          <div
            className="animate-wave-ripple mb-4 flex"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="wave-line h-8 w-8 rounded-full bg-gray-200 bg-opacity-40"></div>
            <div className="ml-2 max-w-[70%]">
              <div className="wave-line h-24 w-72 rounded-lg bg-gray-200 bg-opacity-40"></div>
              <div className="wave-line ml-1 mt-1 h-3 w-16 rounded bg-gray-200 bg-opacity-40"></div>
            </div>
          </div>

          <div
            className="animate-wave-ripple flex h-32 flex-col items-center justify-center"
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
