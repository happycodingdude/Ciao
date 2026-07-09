import { BookOutlined, DeleteOutlined, SyncOutlined } from "@ant-design/icons";
import {
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import ImageWithLightBoxAndNoLazy from "../components/common/ImageWithLightBoxAndNoLazy";
import { bookmarkMessage, getBookmarks } from "../services/bookmark.service";
import { BookmarkItemModel } from "../types/bookmark.types";

const PAGE_LIMIT = 20;

// Preview nội dung theo loại tin — tin không phải text hiển thị nhãn thay nội dung thô.
const previewContent = (item: BookmarkItemModel) => {
  if (item.isUnavailable) return "Tin nhắn không còn khả dụng";
  switch (item.messageType) {
    case "media":
      return "🖼️ Phương tiện";
    case "poll":
      return `📊 ${item.content}`;
    case "contact":
      return `👤 ${item.content}`;
    default:
      return item.content;
  }
};

// Phase 3 — trang "Tin đã lưu": danh sách bookmark cá nhân, click → nhảy về tin gốc.
const Saved = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam }) => getBookmarks(pageParam, PAGE_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage?.hasMore ? pages.length + 1 : undefined,
    staleTime: 0,
  });

  const items = (data?.pages ?? []).flatMap((p) => p?.bookmarks ?? []);

  const openMessage = (item: BookmarkItemModel) => {
    if (item.isUnavailable) return;
    // Điều hướng về hội thoại + messageId để chatbox nhảy/highlight tin gốc.
    navigate({
      to: "/conversations/$conversationId",
      params: { conversationId: item.conversationId },
      search: { messageId: item.messageId } as never,
    });
  };

  const removeBookmark = async (item: BookmarkItemModel) => {
    if (removingId) return;
    setRemovingId(item.id);
    try {
      await bookmarkMessage(item.conversationId, item.messageId, false);
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({
        queryKey: ["bookmarkIds", item.conversationId],
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="text-(--text-main-color) flex h-full w-full flex-col overflow-hidden px-6 py-4">
      <div className="mb-4 flex items-center gap-3">
        <BookOutlined className="text-xl" />
        <h1 className="text-lg font-semibold">Tin nhắn đã lưu</h1>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <SyncOutlined spin className="text-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-(--text-main-color-blur) flex flex-1 flex-col items-center justify-center gap-2">
          <BookOutlined className="text-4xl" />
          <p>Chưa có tin nhắn nào được lưu</p>
          <p className="text-sm">
            Mở menu của một tin nhắn và chọn “Lưu tin nhắn” để xem lại tại đây.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openMessage(item)}
              className={`bg-(--bg-color-light) group rounded-2xl p-4 shadow-sm transition
                ${item.isUnavailable ? "opacity-60" : "hover:bg-(--bg-color-extrathin) cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageWithLightBoxAndNoLazy
                    src={item.senderAvatar ?? undefined}
                    className="pointer-events-none aspect-square w-9"
                    circle
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {item.senderName || "Không rõ người gửi"}
                    </span>
                    <span className="text-(--text-main-color-blur) text-xs">
                      {item.conversationTitle}
                      {item.messageCreatedTime
                        ? ` · ${dayjs(item.messageCreatedTime).format("DD/MM/YYYY HH:mm")}`
                        : ""}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  title="Bỏ lưu"
                  className="text-(--text-main-color-blur) hover:text-(--danger-text-color) rounded-full p-2
                    opacity-0 transition group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(item);
                  }}
                >
                  {removingId === item.id ? (
                    <SyncOutlined spin />
                  ) : (
                    <DeleteOutlined />
                  )}
                </button>
              </div>
              <p
                className={`mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm
                  ${item.isUnavailable ? "text-(--text-main-color-blur) italic" : ""}`}
              >
                {previewContent(item)}
              </p>
            </div>
          ))}

          {hasNextPage && (
            <button
              type="button"
              className="text-(--text-main-color-blur) hover:text-(--text-main-color) py-2 text-sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? <SyncOutlined spin /> : "Tải thêm"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Saved;
