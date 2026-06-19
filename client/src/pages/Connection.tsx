import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import AddFriendPanel from "../components/connection/AddFriendPanel";
import ConnectionFriendList from "../components/connection/ConnectionFriendList";
import ConnectionRequests from "../components/connection/ConnectionRequests";
import ConnectionTabs from "../components/connection/ConnectionTabs";
import useFriend from "../hooks/useFriend";
import { FriendItemProps } from "../types/base.types";
import { ConnectionTab } from "../types/connection.types";
import { FriendCache } from "../types/friend.types";

// Route api riêng để đọc/ghi search param mà không import vòng (route file import page này).
const routeApi = getRouteApi("/_layout/connections");

const Connection = () => {
  const { tab } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const queryClient = useQueryClient();

  // Poll 30s để presence (online/offline) cập nhật real-time — cùng nguồn/nhịp với Dashboard.
  const { data: friendCache } = useFriend({ refetchInterval: 30_000 });
  const friends = friendCache ?? [];

  const allFriends = useMemo(
    () =>
      friends
        .filter((f) => f.contact?.friendStatus === "friend")
        .map((f) => f.contact),
    [friends],
  );

  const onlineFriends = useMemo(
    () => allFriends.filter((c) => c?.isOnline),
    [allFriends],
  );

  const incoming = useMemo(
    () =>
      friends
        .filter((f) => f.contact?.friendStatus === "request_received")
        .map((f) => f.contact),
    [friends],
  );

  const outgoing = useMemo(
    () =>
      friends
        .filter((f) => f.contact?.friendStatus === "request_sent")
        .map((f) => f.contact),
    [friends],
  );

  // Đồng bộ cache ["friend"] sau Accept/Cancel để list cập nhật ngay (cùng pattern Dashboard).
  const handleFriendAction: FriendItemProps["friendAction"] = (
    id,
    status,
    userId,
  ) => {
    queryClient.setQueryData<FriendCache[]>(["friend"], (old) =>
      (old ?? []).map((f) =>
        f.contact?.id !== userId
          ? f
          : {
              ...f,
              contact: {
                ...f.contact,
                friendId: id ?? undefined,
                friendStatus: status ?? undefined,
              },
            },
      ),
    );
  };

  // Add panel thao tác trên contact ngoài cache → invalidate để friend list/Requests đồng bộ.
  const refreshFriends = () =>
    queryClient.invalidateQueries({ queryKey: ["friend"] });

  const setTab = (next: ConnectionTab) => navigate({ search: { tab: next } });

  return (
    <section className="bg-(--bg-color) relative h-screen w-full overflow-hidden">
      {/* #portal (global CSS có height:100%) phải nằm NGOÀI flex container, nếu không nó
          thành flex-item chiếm hết chiều cao và ép vùng flex-1 co về 0. */}
      <div className="flex h-full flex-col">
        {/* Header + tabs cố định (shrink-0); chỉ vùng nội dung tab bên dưới mới scroll. */}
        <div className="mx-auto flex w-full max-w-3xl shrink-0 flex-col gap-6 px-6 pt-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-(--text-main-color) flex items-center gap-3 text-2xl font-semibold">
              <i className="fa-solid fa-user-friends text-(--main-color-bold)" />
              Connections
            </h1>
            <p className="text-(--text-main-color-blur) text-sm">
              Manage your friends, requests and find new people.
            </p>
          </header>

          <ConnectionTabs
            active={tab}
            onChange={setTab}
            counts={{
              all: allFriends.length,
              online: onlineFriends.length,
              requests: incoming.length,
            }}
          />
        </div>

        {/* Vùng nội dung tab — flex-1 + min-h-0, nơi DUY NHẤT được scroll. */}
        <div className="hide-scrollbar mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-6 pb-6 pt-6">
          {tab === "all" && (
            <ConnectionFriendList
              contacts={allFriends}
              friendAction={handleFriendAction}
              searchable
              emptyIcon="fa-user-group"
              emptyTitle="No friends yet"
              emptyHint="Head to the Add friend tab to grow your connections."
            />
          )}

          {tab === "online" && (
            <ConnectionFriendList
              contacts={onlineFriends}
              friendAction={handleFriendAction}
              emptyIcon="fa-circle"
              emptyTitle="No friends online"
              emptyHint="None of your friends are online right now."
            />
          )}

          {tab === "requests" && (
            <ConnectionRequests
              incoming={incoming}
              outgoing={outgoing}
              friendAction={handleFriendAction}
            />
          )}

          {tab === "add" && <AddFriendPanel onChanged={refreshFriends} />}
        </div>
      </div>

      <div id="portal"></div>
    </section>
  );
};

export default Connection;
