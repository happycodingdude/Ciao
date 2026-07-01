import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSignal } from "../../context/SignalContext";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import { useDirectMessage } from "../../hooks/useDirectMessage";
import useOpenDirectChat from "../../hooks/useOpenDirectChat";
import { findDirectConversation } from "../../utils/conversationCache";
import { UserProfile } from "../../types/base.types";
import { ContactModel, QuickChatProps } from "../../types/friend.types";
import { avatarColor, getInitials } from "../../utils/avatar";
import CustomContentEditable from "../common/CustomContentEditable";
import OnlineStatusDot from "../common/OnlineStatusDot";
import FriendCtaButton from "./FriendCtaButton";

// Avatar với fallback initials: hiện chữ cái đầu (màu deterministic theo tên);
// nếu ảnh load được sẽ fade đè lên. Không dùng imagenotfound.jpg nữa.
const QuickAvatar = ({
  src,
  name,
  online,
}: {
  src?: string;
  name?: string;
  online?: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);

  // Reset trạng thái khi đổi user (chọn member khác trong group)
  useEffect(() => setLoaded(false), [src]);

  return (
    <div className="relative w-fit">
      <div
        className="ring-(--portal-container-bg-color) laptop:w-16 relative flex aspect-square w-14 items-center justify-center
          overflow-hidden rounded-full text-lg font-semibold text-white ring-4"
        style={{ backgroundColor: avatarColor(name) }}
      >
        <span>{getInitials(name)}</span>
        {src && (
          <img
            src={src}
            alt={name}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(false)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300
              ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      <OnlineStatusDot
        className="ring-(--portal-container-bg-color) bottom-[6%] right-[6%] ring-2"
        online={online}
      />
    </div>
  );
};

const QuickChat = (props: QuickChatProps) => {
  const { rect, offset, profile, onClose } = props;

  const router = useRouter();
  const { sendToContact } = useDirectMessage();
  const { openChat } = useOpenDirectChat();
  const { data: conversations } = useConversation();
  const { startLocalStream } = useSignal();

  const refQuickProfile = useRef<HTMLDivElement>(null);
  const refInput = useRef<HTMLDivElement>(null);

  const [innerFriend, setInnerFriend] = useState<ContactModel | undefined>(profile);
  // Vị trí dọc của mũi tên anchor (căn theo member được click)
  const [arrowTop, setArrowTop] = useState<number>();

  // Đồng bộ innerFriend khi prop profile thay đổi (chọn thành viên khác trong group)
  useEffect(() => {
    setInnerFriend(profile);
  }, [profile]);

  useEffect(() => {
    // Không cần tính toán vị trí nếu chưa có profile hoặc chưa có rect click
    if (!innerFriend || !rect) return;

    if (refInput.current) {
      refInput.current.textContent = "";
      refInput.current.focus();
    }

    if (!refQuickProfile.current) return;

    // Tính toán vị trí dọc: căn giữa với element được click, nhưng không vượt ra ngoài viewport
    let offsetTop = rect.top - refQuickProfile.current.offsetHeight / 3;
    const maxTopPosition =
      window.innerHeight + window.scrollY - refQuickProfile.current.offsetHeight;
    offsetTop = Math.min(offsetTop, maxTopPosition);

    // Nếu tính ra âm (gần top của viewport) → snap về 0 thay vì bị khuất
    const finalTop = offsetTop < 0 ? 0 : offsetTop;
    refQuickProfile.current.style.top = finalTop + "px";
    // Vị trí ngang: cách phải một khoảng bằng độ rộng panel Information
    refQuickProfile.current.style.right = `${window.scrollY + (offset ?? 0)}px`;

    // Mũi tên anchor: căn theo tâm dọc của member được click, kẹp trong thân thẻ
    const cardHeight = refQuickProfile.current.offsetHeight;
    const arrowCenter = rect.top + rect.height / 2 - finalTop;
    setArrowTop(Math.max(20, Math.min(arrowCenter, cardHeight - 20)));
  }, [innerFriend, rect]);

  // Đẩy panel ra ngoài viewport (slide off) — dùng chung cho Escape / click ngoài / nút đóng
  const slideOff = useCallback(() => {
    if (refQuickProfile.current) refQuickProfile.current.style.right = "-40rem";
  }, []);

  const closeQuickProfileOnKey = useCallback(
    (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape") slideOff();
    },
    [slideOff],
  );
  useEventListener("keydown", closeQuickProfileOnKey);

  const closeQuickProfileOnClick = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      // Click trong panel hoặc click vào item trong member list → giữ panel mở
      if (
        target.closest(".quick-profile") ||
        target.closest(".information-members")
      )
        return;
      slideOff();
    },
    [slideOff],
  );
  useEventListener("click", closeQuickProfileOnClick);

  // Không render khi chưa có profile được chọn
  if (!profile) return null;

  const chat = async () => {
    const message = (refInput.current?.textContent ?? "").trim();
    // Không gửi tin rỗng (tránh tạo conversation/tin nhắn trắng)
    if (!message) return;

    await sendToContact(
      innerFriend!,
      { type: "text", content: message },
      {
        // Prefetch data để navigation vào conversation diễn ra mượt không bị loading
        prefetch: true,
        onNavigate: (convId) =>
          router.navigate({ to: `/conversations/${convId}` }),
      },
    );
    onClose?.();
  };

  const keydownBindingFn = (e: React.KeyboardEvent<HTMLElement>) => {
    // Enter không Shift → gửi tin; Shift+Enter → xuống dòng trong quick chat
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chat();
    }
  };

  // Mở hội thoại đầy đủ với thành viên. Dùng hook chuẩn useOpenDirectChat: tự điều
  // hướng nếu đã có hội thoại trực tiếp, hoặc tạo mới (seed cache theo id thật để
  // tránh race/vỡ header). slideOff thay vì onClose để không unmount giữa lúc hook
  // đang chạy async (tránh setState sau unmount).
  const openConversation = () => {
    if (!innerFriend) return;
    // Ưu tiên tra hội thoại trực tiếp có sẵn trong cache list (nguồn tin cậy giống
    // danh sách chat) để điều hướng tức thì, không phụ thuộc field directConversation
    // của member (không được populate). Không thấy → openChat sẽ tạo mới.
    const existing = findDirectConversation(
      conversations?.conversations ?? [],
      innerFriend.id ?? "",
    );
    openChat(
      existing?.id
        ? { ...innerFriend, directConversation: existing.id }
        : innerFriend,
    );
    slideOff();
  };

  // Gọi video: dùng chung luồng WebRTC hiện có (giống nút gọi ở header hội thoại).
  const videoCall = () => {
    if (!innerFriend) return;
    startLocalStream(innerFriend as unknown as UserProfile);
    onClose?.();
  };

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
  ): void => {
    setInnerFriend((current) => ({
      ...current!,
      friendId: id ?? undefined,
      // null status → undefined (không có quan hệ bạn bè, tránh lưu null vào state)
      friendStatus: status === null ? undefined : status,
    }));
  };

  return (
    <div
      ref={refQuickProfile}
      className="quick-profile bg-(--portal-container-bg-color) border-(--modal-border-color) -right-160 laptop:w-72 fixed w-64
        rounded-xl border shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
    >
      {/* Mũi tên anchor trỏ về phía member được click (bên phải) */}
      {arrowTop !== undefined && (
        <div
          style={{ top: arrowTop, borderLeftColor: "var(--portal-container-bg-color)" }}
          className="absolute right-0 -translate-y-1/2 translate-x-full border-y-8 border-r-0 border-l-8 border-y-transparent"
        ></div>
      )}

      {/* Dải accent mảnh thay cho nền xanh đặc 2 tông cũ */}
      <div className="from-(--sidebar-from) to-(--sidebar-to) relative h-14 rounded-t-xl bg-gradient-to-r">
        <button
          type="button"
          aria-label="Đóng"
          onClick={slideOff}
          className="absolute right-2 top-2 flex aspect-square w-6 items-center justify-center rounded-full
            bg-white/25 text-white transition-colors hover:bg-white/40"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar đè lên banner + CTA (Add/Accept/Cancel) căn phải */}
        <div className="-mt-8 flex items-end justify-between">
          <QuickAvatar
            src={innerFriend?.avatar}
            name={innerFriend?.name}
            online={innerFriend?.isOnline}
          />
          <div className="mb-1">
            <FriendCtaButton
              friend={innerFriend}
              friendAction={handleFriendAction}
              addLabel="Add friend"
            />
          </div>
        </div>

        {/* Tên + vai trò */}
        <div className="mt-2 flex items-center gap-2">
          <p className="text-(--text-main-color) truncate text-sm font-semibold">
            {innerFriend?.name}
          </p>
          {innerFriend?.isModerator && (
            <span className="text-3xs from-light-blue-300 to-light-blue-500 shrink-0 rounded-full bg-gradient-to-br px-2 py-0.5 font-medium text-white">
              Admin
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span
            className="aspect-square w-2 rounded-full"
            style={{
              backgroundColor: innerFriend?.isOnline
                ? "var(--online-color)"
                : "var(--offline-color)",
            }}
          ></span>
          <span className="text-(--text-main-color-blur) text-xs">
            {innerFriend?.isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Hàng hành động nhanh (chỉ gồm các action có backend thật) */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={openConversation}
            className="bg-(--bg-color-extrathin) hover:bg-(--bg-color-thin) text-(--text-main-color) flex flex-1 items-center
              justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors"
          >
            <i className="fa-solid fa-comment text-(--main-color)"></i>
            <span>Message</span>
          </button>
          <button
            type="button"
            onClick={videoCall}
            className="bg-(--bg-color-extrathin) hover:bg-(--bg-color-thin) text-(--text-main-color) flex flex-1 items-center
              justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors"
          >
            <i className="fa-solid fa-video text-(--main-color)"></i>
            <span>Call</span>
          </button>
        </div>

        {/* Ô nhập + nút gửi */}
        <div className="bg-(--search-bg-color) border-(--border-color) mt-3 flex items-center gap-2 rounded-lg border py-2 pl-3 pr-2">
          <CustomContentEditable
            ref={refInput}
            className="text-(--text-main-color) grow"
            onKeyDown={keydownBindingFn}
            placeholder={`Message @${innerFriend?.name ?? ""}…`}
            quickChat
          />
          <button
            type="button"
            aria-label="Gửi"
            onClick={chat}
            className="bg-(--main-color) hover:bg-(--main-color-bold) flex aspect-square w-8 shrink-0 items-center
              justify-center rounded-full text-white transition-colors"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
