import "../listchat.css";

const ListchatLoading = (props) => {
  const { className } = props;
  return (
    <div
      id="sidebar-loading-3"
      className="bg-primary-light flex h-full w-full grow flex-col border-r border-gray-200"
    >
      <div
        className="animate-wave-ripple flex flex-1 items-center border-b border-gray-100 p-3"
        style={{ animationDelay: "0s" }}
      >
        <div className="wave-line h-12 w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
        <div className="ml-3 flex-1">
          <div className="wave-line mb-2 h-4 w-32 rounded bg-gray-200 bg-opacity-40"></div>
          <div className="wave-line h-3 w-40 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
        <div className="text-xs text-gray-400">
          <div className="wave-line h-3 w-10 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
      </div>

      <div
        className="animate-wave-ripple flex flex-1 items-center border-b border-gray-100 p-3"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="wave-line h-12 w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
        <div className="ml-3 flex-1">
          <div className="wave-line mb-2 h-4 w-36 rounded bg-gray-200 bg-opacity-40"></div>
          <div className="wave-line h-3 w-28 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
        <div className="text-xs text-gray-400">
          <div className="wave-line h-3 w-10 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
      </div>

      <div
        className="animate-wave-ripple flex flex-1 items-center border-b border-gray-100 p-3"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="wave-line h-12 w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
        <div className="ml-3 flex-1">
          <div className="wave-line mb-2 h-4 w-24 rounded bg-gray-200 bg-opacity-40"></div>
          <div className="wave-line h-3 w-44 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
        <div className="text-xs text-gray-400">
          <div className="wave-line h-3 w-10 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
      </div>

      <div
        className="animate-wave-ripple flex flex-1 items-center border-b border-gray-100 p-3"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="wave-line h-12 w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
        <div className="ml-3 flex-1">
          <div className="wave-line mb-2 h-4 w-28 rounded bg-gray-200 bg-opacity-40"></div>
          <div className="wave-line h-3 w-36 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
        <div className="text-xs text-gray-400">
          <div className="wave-line h-3 w-10 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
      </div>

      <div
        className="animate-wave-ripple flex flex-1 items-center border-b border-gray-100 p-3"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="wave-line h-12 w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
        <div className="ml-3 flex-1">
          <div className="wave-line mb-2 h-4 w-28 rounded bg-gray-200 bg-opacity-40"></div>
          <div className="wave-line h-3 w-36 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
        <div className="text-xs text-gray-400">
          <div className="wave-line h-3 w-10 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
      </div>

      <div
        className="animate-wave-ripple flex flex-1 items-center border-b border-gray-100 p-3"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="wave-line h-12 w-12 rounded-full bg-gray-200 bg-opacity-40"></div>
        <div className="ml-3 flex-1">
          <div className="wave-line mb-2 h-4 w-28 rounded bg-gray-200 bg-opacity-40"></div>
          <div className="wave-line h-3 w-36 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
        <div className="text-xs text-gray-400">
          <div className="wave-line h-3 w-10 rounded bg-gray-200 bg-opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export default ListchatLoading;
