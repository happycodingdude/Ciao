import { toast } from "react-toastify";
import { isConversationActive } from "../hooks/useActiveConversation";
import { ContactSettings, UserProfile } from "../types/base.types";
import {
  MemberJoinedByLinkEvent,
  NewFriendRequest,
  NewMessage,
  NewReaction,
} from "../types/notification.types";

// ─────────────────────────────────────────────────────────────────────────────
// In-app banner (foreground). Khi đang mở app, FCM `onMessage` không tự hiện
// banner OS → ta render toast clickable. Logic thuần ở đây (buildBanner) trả về
// spec + đích điều hướng; SignalContext thực thi navigate (typed theo route tree).
// Mọi banner đều gated theo ContactSettings (đọc tươi qua infoRef ở SignalContext).
// ─────────────────────────────────────────────────────────────────────────────

// Đích điều hướng — discriminated union để callsite navigate type-safe.
export type BannerNav =
  | { kind: "conversation"; conversationId: string; messageId?: string }
  | { kind: "friendRequests" };

export type BannerSpec = {
  avatar?: string | null;
  title: string;
  body: string;
  nav: BannerNav;
};

const REACTION_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  care: "🥰",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

// Master push tắt → không banner gì. Per-type tắt → bỏ đúng loại đó.
const pushOn = (s?: ContactSettings) => s?.pushEnabled !== false;

// Đang ở trang conversations (đang chat) → không banner để khỏi làm phiền.
// Bao trùm cả 3 loại + cả trang list (/conversations) lẫn 1 hội thoại cụ thể.
// pathname do TanStack router cập nhật theo history API nên luôn phản ánh route hiện tại.
const isOnConversationsPage = () =>
  window.location.pathname.startsWith("/conversations");

// Gate dùng CHUNG cho banner (foreground) lẫn chấm đỏ tab (background): event này có
// đáng báo cho user không, theo settings + tính áp dụng (sender/owner). KHÔNG xét
// route — vì chấm đỏ tab cần hiện kể cả khi app đang ở trang conversations (user đang
// xem tab KHÁC). Riêng banner foreground còn loại thêm conversations-page ở buildBanner.
export const passesNotificationGate = (
  event: string,
  data: unknown,
  info: UserProfile,
): boolean => {
  const s = info.settings;
  if (!pushOn(s)) return false;

  switch (event) {
    case "NewMessage": {
      if (s?.notifyOnMessage === false) return false;
      const m = data as NewMessage;
      if (!m.conversation?.id) return false;
      // Tin của chính mình (multi-tab) → bỏ.
      if (m.contact?.id && m.contact.id === info.id) return false;
      return true;
    }
    case "NewFriendRequest":
      return s?.notifyOnFriendRequest !== false;
    // Có người vào nhóm qua link (event chỉ gửi cho quản trị) — không có setting riêng,
    // chỉ gate theo master pushEnabled (đã check ở trên).
    case "MemberJoinedByLink":
      return true;
    case "NewReaction": {
      if (s?.notifyOnReaction === false) return false;
      const r = data as NewReaction;
      if (!r.type) return false; // unreact → bỏ
      if (!r.messageOwnerId || r.messageOwnerId !== info.id) return false;
      if (r.reactorId && r.reactorId === info.id) return false;
      return true;
    }
    default:
      return false;
  }
};

// Trả null nếu bị gate / không áp dụng / đang ở trang conversations.
export const buildBanner = (
  event: string,
  data: unknown,
  info: UserProfile,
): BannerSpec | null => {
  if (!passesNotificationGate(event, data, info)) return null;
  // Suppress-trên-trang-conversations chỉ áp cho event có nội dung tự hiển thị ở list
  // (tin nhắn/reaction đẩy hội thoại lên đầu). "Có người vào nhóm qua link" KHÔNG tự hiện
  // ở đâu trên trang này → vẫn banner; chỉ bỏ khi đang mở ĐÚNG hội thoại đó (case bên dưới).
  if (event !== "MemberJoinedByLink" && isOnConversationsPage()) return null;

  switch (event) {
    case "NewMessage": {
      const m = data as NewMessage;
      const conv = m.conversation;
      if (!conv?.id) return null;
      const sender = m.contact?.name?.trim() || "Ai đó";
      const body = conv.isGroup
        ? `đã gửi tin nhắn đến ${conv.title?.trim() || "nhóm"}`
        : "đã gửi tin nhắn đến bạn";
      return {
        avatar: m.contact?.avatar,
        title: sender,
        body,
        nav: { kind: "conversation", conversationId: conv.id },
      };
    }

    case "NewFriendRequest": {
      const f = data as NewFriendRequest;
      const sender = f.contactName?.trim() || "Ai đó";
      return {
        avatar: f.contactAvatar,
        title: sender,
        body: "đã gửi cho bạn lời mời kết bạn",
        nav: { kind: "friendRequests" },
      };
    }

    case "MemberJoinedByLink": {
      const j = data as MemberJoinedByLinkEvent;
      if (!j.conversationId) return null;
      // Đang mở đúng hội thoại đó → dòng hệ thống "joined via invite link" đã thấy tại chỗ.
      if (isConversationActive(j.conversationId)) return null;
      return {
        avatar: j.actorAvatar,
        title: j.actorName?.trim() || "Ai đó",
        body: `đã tham gia ${j.title?.trim() || "nhóm"} qua link mời`,
        nav: { kind: "conversation", conversationId: j.conversationId },
      };
    }

    case "NewReaction": {
      const r = data as NewReaction;
      if (!r.conversationId || !r.messageId) return null;
      const reactor = r.reactorName?.trim() || "Ai đó";
      const emoji = (r.type && REACTION_EMOJI[r.type]) || "";
      return {
        avatar: r.reactorAvatar,
        title: reactor,
        body: `đã thả ${emoji} vào tin nhắn của bạn`,
        nav: {
          kind: "conversation",
          conversationId: r.conversationId,
          messageId: r.messageId,
        },
      };
    }

    default:
      return null;
  }
};

const BannerToast = ({ spec }: { spec: BannerSpec }) => (
  <div className="flex items-center gap-3">
    {spec.avatar ? (
      <img
        src={spec.avatar}
        alt={spec.title}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    ) : (
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-light-blue-100 text-sm font-semibold text-light-blue-600">
        {spec.title.charAt(0).toUpperCase()}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold">{spec.title}</p>
      <p className="truncate text-xs opacity-80">{spec.body}</p>
    </div>
  </div>
);

// Hiển thị toast clickable. onClick do callsite cung cấp (đã có navigate typed).
export const showBannerToast = (spec: BannerSpec, onClick: () => void) => {
  toast(<BannerToast spec={spec} />, {
    onClick,
    autoClose: 4000,
    closeOnClick: true,
    className: "cursor-pointer",
  });
};
