import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import HomeHero from "../components/home/HomeHero";
import HomeOnlineFriends from "../components/home/HomeOnlineFriends";
import HomePendingRequests from "../components/home/HomePendingRequests";
import HomeQuickActions from "../components/home/HomeQuickActions";
import HomeRecentChats from "../components/home/HomeRecentChats";
import HomeStats, { HomeStat } from "../components/home/HomeStats";
import useConversation from "../hooks/useConversation";
import useFriend from "../hooks/useFriend";
import useInfo from "../hooks/useInfo";
import { FriendItemProps } from "../types/base.types";
import { FriendCache } from "../types/friend.types";

const RECENT_LIMIT = 6;

const Home = () => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversationCache } = useConversation();
  // Poll lại friend list mỗi 30s (khớp presence ping/threshold 60s) để Dashboard
  // cập nhật online/offline real-time. Chỉ áp dụng ở Home; unmount → react-query tự dừng polling.
  const { data: friendCache } = useFriend({ refetchInterval: 30_000 });

  const conversations = conversationCache?.conversations ?? [];
  const friends = friendCache ?? [];

  // Chat gần đây: chỉ lấy hội thoại đã có tin nhắn, sort theo thời gian giảm dần
  const recentChats = useMemo(
    () =>
      [...conversations]
        .filter((c) => c.lastMessageTime)
        .sort(
          (a, b) =>
            dayjs(b.lastMessageTime).valueOf() -
            dayjs(a.lastMessageTime).valueOf(),
        )
        .slice(0, RECENT_LIMIT),
    [conversations],
  );

  const unreadCount = useMemo(
    () => conversations.filter((c) => c.unSeen).length,
    [conversations],
  );

  // Set id bạn bè đang online — single source of truth (poll 30s từ /friends).
  // Dùng cho cả status dot ở Recent Chats để không phụ thuộc conversation cache (vốn không poll).
  const onlineFriendIds = useMemo(
    () =>
      new Set(
        friends
          .filter((f) => f.contact?.isOnline && f.contact?.id)
          .map((f) => f.contact!.id as string),
      ),
    [friends],
  );

  const onlineFriends = useMemo(
    () =>
      friends
        .filter(
          (f) =>
            f.contact?.friendStatus === "friend" && f.contact?.isOnline,
        )
        .map((f) => f.contact),
    [friends],
  );

  const pendingRequests = useMemo(
    () =>
      friends
        .filter((f) => f.contact?.friendStatus === "request_received")
        .map((f) => f.contact),
    [friends],
  );

  const totalFriends = useMemo(
    () => friends.filter((f) => f.contact?.friendStatus === "friend").length,
    [friends],
  );

  const stats: HomeStat[] = [
    {
      label: "Unread chats",
      value: unreadCount,
      icon: "fa-envelope-open-text",
      gradient: "from-neo-blue to-neo-purple",
      to: "/conversations",
    },
    {
      label: "Friends online",
      value: onlineFriends.length,
      icon: "fa-bolt",
      gradient: "from-neo-green to-neo-teal",
      to: "/connections",
      search: { tab: "online" },
    },
    {
      label: "Requests",
      value: pendingRequests.length,
      icon: "fa-user-plus",
      gradient: "from-neo-pink to-neo-orange",
      to: "/connections",
      search: { tab: "requests" },
    },
    {
      label: "Friends",
      value: totalFriends,
      icon: "fa-user-group",
      gradient: "from-neo-purple to-neo-pink",
      to: "/connections",
      search: { tab: "all" },
    },
  ];

  // Đồng bộ cache ["friend"] sau khi Accept/Deny lời mời để list cập nhật ngay
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

  return (
    <section className="bg-(--bg-color) absolute inset-0 overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <HomeHero
          name={info?.name}
          avatar={info?.avatar}
          isOnline={info?.isOnline}
          unreadCount={unreadCount}
        />

        <HomeStats stats={stats} />

        <HomeQuickActions />

        <div className="grid grid-cols-1 gap-6 laptop:grid-cols-3">
          <div className="laptop:col-span-2">
            <HomeRecentChats
              conversations={recentChats}
              selfId={info?.id}
              onlineFriendIds={onlineFriendIds}
            />
          </div>
          <div className="flex flex-col gap-6">
            <HomeOnlineFriends friends={onlineFriends} />
            <HomePendingRequests
              requests={pendingRequests}
              friendAction={handleFriendAction}
            />
          </div>
        </div>
      </div>

      <div id="portal"></div>
    </section>
  );
};

export default Home;
