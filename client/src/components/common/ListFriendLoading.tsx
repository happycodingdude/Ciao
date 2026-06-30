import "../../styles/listchat.css";

const ListFriendLoading = (props: { className?: string }) => {
  const { className } = props;
  const numberOfLoadingDiv = 4;
  return (
    <div className="flex h-full w-full grow flex-col">
      {Array.from({ length: numberOfLoadingDiv }).map((_, index) => (
        <div
          className="flex flex-1 animate-wave-ripple items-center border-b border-(--border-color)  p-3"
          style={{ animationDelay: "0s" }}
        >
          {/* MARK: Avatar */}
          <div className="wave-line shimmer-effect aspect-square w-12 rounded-full bg-(--skeleton-base) bg-opacity-40"></div>
          {/* MARK: Content */}
          <div className="ml-3 flex-1">
            <div className="wave-line shimmer-effect mb-2 h-4 w-40 rounded-sm bg-(--skeleton-base) bg-opacity-40"></div>
          </div>
          {/* MARK: Time */}
          <div className="w-10 text-xs text-(--text-main-color-blur)">
            <div className="wave-line shimmer-effect h-3 rounded-sm bg-(--skeleton-base) bg-opacity-40"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListFriendLoading;
