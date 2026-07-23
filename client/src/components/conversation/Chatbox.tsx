import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useBookmark } from "../../hooks/useBookmark";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { useChatboxScroll } from "../../hooks/useChatboxScroll";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import useMessage from "../../hooks/useMessage";
import { usePinMessage } from "../../hooks/usePinMessage";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { markRead } from "../../services/message.service";
import { ConversationCache } from "../../types/conv.types";
import {
  GroupedMessage,
  PendingMessageModel,
  SeenContact,
} from "../../types/message.types";
import { formatDate, formatDisplayDate } from "../../utils/datetime";
import {
  buildFailedPending,
  getPersistedFailed,
} from "../../utils/failedMessageStore";
import { appendMessage, flattenInfinite } from "../../utils/messageCache";
import {
  markConversationSeen,
  updateMemberReadHorizon,
} from "../../utils/notificationCacheHelpers";
import FetchingMoreMessages from "../common/FetchingMoreMessages";
import RelightBackground from "../common/RelightBackground";
import MessageContent from "../message/MessageContent";

// Gom tin nhắn thành nhóm theo ngày, rồi trong mỗi ngày gom tiếp theo người gửi liên tiếp
const groupMessagesByDate = (
  messages: PendingMessageModel[],
): Record<string, GroupedMessage[]> =>
  messages.reduce(
    (groups, msg) => {
      const date = formatDate(msg.createdTime ?? "");
      if (!groups[date]) groups[date] = [];
      const dateGroups = groups[date];
      const lastGroup = dateGroups[dateGroups.length - 1];
      // Tin hệ thống KHÔNG gom block: block system chỉ render content của tin đầu,
      // 2 tin hệ thống liên tiếp (vd. đổi theme 2 lần) mà gom chung sẽ mất dòng sau.
      const isSystem =
        msg.type === "system" ||
        lastGroup?.messages[lastGroup.messages.length - 1]?.type === "system";
      if (lastGroup && lastGroup.contactId === msg.contactId && !isSystem) {
        // Cùng người gửi liên tiếp → gom vào block hiện tại (hiển thị avatar/tên một lần)
        lastGroup.messages.push(msg);
      } else {
        // Người gửi khác → tạo block mới
        dateGroups.push({ contactId: msg.contactId ?? "", messages: [msg] });
      }
      return groups;
    },
    {} as Record<string, GroupedMessage[]>,
  );

const Chatbox = () => {
  const { conversationId } = Route.useParams();
  // `?messageId` chỉ còn dùng cho banner notification (SignalContext ở tầng trên context jump)
  // giao target qua URL khi điều hướng (có thể cross-conversation). Panel Pin/Bookmark/Search
  // KHÔNG còn set param này — chúng đi qua jump target in-memory bên dưới.
  const { messageId: urlMessageId } = Route.useSearch();
  const { jumpTarget, requestJump, clearJump } = useChatDetailToggles();
  // Chỉ nhận jump khi target thuộc đúng hội thoại đang mở (chống rò target giữa lúc đổi hội thoại).
  const jumpMessageId =
    jumpTarget?.conversationId === conversationId
      ? jumpTarget.messageId
      : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: conversations } = useConversation();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );
  // Latest-ref: giữ conversation mới nhất để effect markRead đọc read horizon của self
  // mà KHÔNG cần thêm `conversation` vào deps → giữ tối ưu "effect chỉ chạy lại khi tin
  // cuối đổi", không re-run mỗi lần cache mutate (reaction/seen/confirm).
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  const { data: info } = useInfo();

  // Eager-fetch trạng thái ghim / đã lưu Ở CẤP HỘI THOẠI (KHÔNG phụ thuộc việc render tin nhắn).
  // LÝ DO: 2 query này (["pinnedIds"|"bookmarkIds", conversationId]) nếu CHỈ mount gián tiếp qua
  // MessageContent/MessageMenu_Slide sẽ không chạy cho hội thoại toàn tin hệ thống / rỗng / tin ẩn
  // sau divider → /pins/ids, /bookmarks/ids không được gọi. Mount tại Chatbox (luôn tồn tại khi mở
  // hội thoại) đảm bảo fetch đúng 1 lần.
  //
  // eager=true: đây là nơi DUY NHẤT được fetch. Observer ở tầng message dùng eager=false (mặc
  // định) → chỉ đọc cache này, không tự bắn thêm request kể cả khi query lỗi/stale.
  usePinMessage(conversationId, true);
  useBookmark(conversationId, true);

  const { data, hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage } =
    useMessage(conversationId);
  // Flatten các page (chronological cũ→mới) — nguồn duy nhất cho render & các effect bên dưới.
  const messages = useMemo(() => flattenInfinite(data), [data]);

  const oldLastMsgRef = useRef<PendingMessageModel | null>(null);
  const isInitialLoad = useRef(true);

  // New Message Divider: id của tin CHƯA ĐỌC đầu tiên khi mở hội thoại.
  // Tính đúng MỘT lần cho mỗi hội thoại (freeze) rồi giữ nguyên suốt phiên xem — không nhảy
  // khi markRead chạy (1s sau) hay khi có tin mới đến. Đổi hội thoại → tính lại.
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const dividerComputedRef = useRef(false);
  // Divider 2 bước: khi mở hội thoại có tin chưa đọc, các tin mới bị ẨN, chỉ hiện text nhấp
  // nháy "n tin nhắn mới". Người dùng bấm text → newRevealed=true → hiện vạch + các tin mới.
  const [newRevealed, setNewRevealed] = useState(false);
  // Khôi phục tin lỗi đã persist (một lần / hội thoại) — chống mất tin lỗi khi tải lại trang.
  const failedRestoredRef = useRef<string | null>(null);

  const {
    refChatContent,
    contentRef,
    bottomRef,
    scrollToBottom,
    suppressAutoStick,
    showScrollToBottom,
  } = useChatboxScroll(
      hasPreviousPage,
      isFetchingPreviousPage,
      fetchPreviousPage,
      messages[0]?.id,
      conversationId,
    );

  // Reset state khi chuyển sang conversation khác
  useEffect(() => {
    isInitialLoad.current = true;
    oldLastMsgRef.current = null;
    // Reset mốc divider để tính lại cho hội thoại mới
    dividerComputedRef.current = false;
    setFirstUnreadId(null);
    setNewRevealed(false);
    failedRestoredRef.current = null;
    if (refChatContent.current) {
      // Tắt smooth scroll trước khi reset để không animate khi jump về đầu
      refChatContent.current.style.scrollBehavior = "auto";
    }
  }, [conversationId]);

  // Tính mốc "tin chưa đọc đầu tiên" đúng một lần khi hội thoại có dữ liệu.
  // Neo theo lastSeenTime của CHÍNH MÌNH tại thời điểm mở (trước khi markRead nâng mốc).
  useEffect(() => {
    if (dividerComputedRef.current) return;
    if (messages.length === 0 || !conversation || !info?.id) return;

    const selfMember = (conversation.members ?? []).find(
      (m) => m.contact?.id === info.id,
    );
    // Ưu tiên mốc đọc của self ở member; fallback lastSeenTime cấp conversation.
    const seenRaw = selfMember?.lastSeenTime ?? conversation.lastSeenTime ?? null;
    const seenMs = seenRaw ? dayjs(seenRaw).valueOf() : 0;

    // Tin chưa đọc = tin của NGƯỜI KHÁC, đã confirmed (có id), tạo sau mốc đã đọc.
    // Loại system message (joined/left…): dòng hệ thống không phải "tin nhắn mới" — nếu tính,
    // hội thoại vừa join qua link sẽ hiện chip "n tin nhắn mới" đếm toàn dòng join/leave
    // (system message của CHÍNH lượt join tạo sau mốc LastSeenTime=join time vài ms).
    const firstUnread = messages.find(
      (m) =>
        m.contactId !== info.id &&
        m.type !== "system" &&
        !!m.id &&
        !m.pending &&
        dayjs(m.createdTime ?? "").valueOf() > seenMs,
    );

    dividerComputedRef.current = true;
    setFirstUnreadId(firstUnread?.id ?? null);
    // Guard "khung chat trống": nếu tin chưa đọc đầu tiên là TIN ĐẦU của danh sách đã load
    // (mốc đã-đọc null/quá cũ — vd vừa vào lại nhóm bằng link) thì ẩn-chờ-reveal sẽ giấu
    // TOÀN BỘ tin nhắn → chat trống dù API có data. Trường hợp này auto-reveal ngay: hiện đủ
    // lịch sử + vạch "Tin nhắn mới" ở đầu. Set tại đây (một lần, cùng lúc freeze divider) để
    // load-more prepend trang cũ về sau không làm phần tin sau vạch bị ẩn lại đột ngột.
    if (firstUnread && firstUnread.id === messages[0]?.id) setNewRevealed(true);
  }, [messages, conversation, info?.id]);

  // Khôi phục tin GỬI LỖI đã lưu (localStorage) vào danh sách sau khi trang tải lại — tin lỗi
  // không nằm ở server nên phải tự chèn lại để người dùng vẫn thấy và bấm "Gửi lại".
  // Chạy đúng một lần / hội thoại, sau khi cache tin đã có (data) để append an toàn.
  useEffect(() => {
    if (failedRestoredRef.current === conversationId) return;
    if (!data || !conversationId) return;

    const persisted = getPersistedFailed(conversationId);
    if (persisted.length > 0) {
      const existingIds = new Set(messages.map((m) => m.id));
      persisted.forEach((rec) => {
        if (existingIds.has(rec.id)) return;
        appendMessage(
          queryClient,
          conversationId,
          buildFailedPending(rec, info?.id),
        );
      });
    }
    failedRestoredRef.current = conversationId;
  }, [conversationId, data, messages, info?.id, queryClient]);

  useEffect(() => {
    // Không làm gì nếu chưa có tin nhắn
    if (messages.length === 0) return;
    const container = refChatContent.current;
    const currentLastMsg = messages[messages.length - 1];

    if (isInitialLoad.current) {
      if (container) {
        // Lần đầu load: jump thẳng xuống đáy không có animation
        container.style.scrollBehavior = "auto";
        container.scrollTop = container.scrollHeight;
      }
      isInitialLoad.current = false;
      requestAnimationFrame(() => {
        // Sau khi jump xong → bật lại smooth scroll cho các lần scroll sau
        if (container) container.style.scrollBehavior = "smooth";
      });
    } else if (currentLastMsg?.id !== oldLastMsgRef.current?.id) {
      // Tin mới (id đổi): CHỈ auto-scroll khi đang ở gần đáy (showScrollToBottom=false) để
      // không cướp vị trí khi user đang đọc lịch sử; hoặc tin mới là của chính mình (vừa gửi
      // → luôn kéo xuống). Tránh "đang đọc tin cũ thì bị nhảy xuống đáy mỗi khi có tin mới".
      const isMine = currentLastMsg?.contactId === info?.id;
      if (isMine || !showScrollToBottom) scrollToBottom("smooth");
    }

    oldLastMsgRef.current = currentLastMsg;
  }, [messages, info?.id, showScrollToBottom, scrollToBottom]);

  // Bridge banner → jump target in-memory. Banner notification (SignalContext) nằm TRÊN context
  // jump nên chỉ có thể giao target qua URL `?messageId` khi điều hướng (có thể cross-conversation).
  // Ở đây nhận param đó, đẩy vào jump target in-memory rồi XÓA param ngay → address bar sạch và
  // Chatbox chỉ có DUY NHẤT một luồng jump (đọc jumpMessageId), không cần xử lý 2 nguồn song song.
  useEffect(() => {
    if (!urlMessageId) return;
    requestJump(conversationId, urlMessageId);
    navigate({
      to: "/conversations/$conversationId",
      params: { conversationId },
      search: {},
      replace: true,
    });
  }, [urlMessageId, conversationId, requestJump, navigate]);

  // Đổi hội thoại giữa lúc jump còn dở (chưa tìm thấy tin, đang kéo dần trang cũ) → bỏ target cũ
  // để không kích hoạt jump nhầm khi user quay lại. Chỉ xóa target KHÁC hội thoại hiện tại nên
  // không đụng target vừa set cho hội thoại đang mở (an toàn bất kể thứ tự effect với bridge).
  useEffect(() => {
    if (jumpTarget && jumpTarget.conversationId !== conversationId) clearJump();
  }, [conversationId, jumpTarget, clearJump]);

  // Nhảy tới + highlight 1 tin cụ thể khi có jump target (Pin/Bookmark/Search, hoặc banner đã bridge).
  // Mỗi message render với id={message.id} (MessageContent) → getElementById tìm DOM.
  //
  // Tin có thể nằm SÂU trong lịch sử, chưa có trong các page mới-nhất đã load.
  // → Nếu tin chưa nằm trong tập đã load: kéo thêm trang CŨ (fetchPreviousPage) rồi để effect
  //   chạy lại (deps có `messages`) — lặp tới khi tin xuất hiện hoặc hết trang cũ.
  //   getMessages/around đều đọc cùng Redis cache full-history nên mọi tin search đều tới được.
  //   (Page size nhỏ → tin rất cũ tốn nhiều round-trip; tối ưu thực sự là server-side page-jump.)
  // Khi đã load: tin có thể chưa kịp gắn DOM (render async) → retry vài nhịp rồi scroll + highlight.
  // clearJump() ở MỌI terminal state (nhảy xong / hết trang cũ mà không thấy tin / hết lượt retry
  // DOM) — các panel dùng jumpTarget làm cờ khoá click trong lúc jump đang chạy, target kẹt lại =
  // khoá vĩnh viễn. Tin không tồn tại (đã xoá/recall) → clear + no-op graceful.
  useEffect(() => {
    if (!jumpMessageId) return;
    // Chưa có page đầu (đổi hội thoại / mở URL trực tiếp) → chờ dữ liệu, chưa kết luận gì.
    if (!data) return;

    const loaded = messages.some((m) => m.id === jumpMessageId);
    if (!loaded) {
      // Chưa thấy tin trong tập đã load → kéo trang cũ hơn (nếu còn) rồi chờ effect re-run.
      if (hasPreviousPage && !isFetchingPreviousPage) fetchPreviousPage();
      // Hết trang cũ mà vẫn không thấy (tin đã xoá/không thuộc hội thoại) → clear để mở khoá.
      else if (!hasPreviousPage && !isFetchingPreviousPage) clearJump();
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(jumpMessageId);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.add("message-highlight");
        setTimeout(() => el.classList.remove("message-highlight"), 2200);
        clearJump();
        return;
      }
      if (attempts++ < 10) setTimeout(tryScroll, 250);
      // Tin đã load nhưng DOM không xuất hiện sau 10 nhịp (bị ẩn sau divider tin mới...) →
      // clear để không kẹt khoá click.
      else clearJump();
    };

    const t = setTimeout(tryScroll, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    jumpMessageId,
    data,
    messages,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    clearJump,
  ]);

  // Đang trong quá trình "jump tới tin" mà tin chưa load (effect trên đang kéo dần trang cũ).
  // Giá trị này GIỮ NGUYÊN true LIÊN TỤC suốt vòng lặp — kể cả khoảng nghỉ giữa 2 lần fetch khi
  // `isFetchingPreviousPage` thoáng về false — nhờ điều kiện `hasPreviousPage`. Dùng nó để giữ
  // overlay "loading older" SÁNG STEADY thay vì nháy on/off mỗi page (fix nháy khi click tin ở xa).
  const isJumpingToTarget = useMemo(() => {
    if (!jumpMessageId) return false;
    const loaded = messages.some((m) => m.id === jumpMessageId);
    return !loaded && (hasPreviousPage || isFetchingPreviousPage);
  }, [jumpMessageId, messages, hasPreviousPage, isFetchingPreviousPage]);

  // --- Divider 2 bước: ẩn phần tin mới cho tới khi người dùng bấm "n tin nhắn mới" ---
  // Khai báo TRƯỚC effect markRead vì effect đó phụ thuộc `hasHiddenNew` (tránh TDZ).
  const firstUnreadIndex = useMemo(
    () =>
      firstUnreadId ? messages.findIndex((m) => m.id === firstUnreadId) : -1,
    [messages, firstUnreadId],
  );
  // Còn tin mới đang ẩn (chưa reveal)?
  const hasHiddenNew = !newRevealed && firstUnreadIndex >= 0;
  // Số tin mới (của người khác, không tính dòng hệ thống) đang ẩn — cập nhật khi có tin mới đến.
  const hiddenNewCount = useMemo(() => {
    if (firstUnreadIndex < 0) return 0;
    return messages
      .slice(firstUnreadIndex)
      .filter((m) => m.contactId !== info?.id && m.type !== "system").length;
  }, [messages, firstUnreadIndex, info?.id]);
  // Danh sách render: ẩn phần tin mới khi chưa reveal.
  const renderedMessages = hasHiddenNew
    ? messages.slice(0, firstUnreadIndex)
    : messages;

  // Auto-reveal: nếu vùng đang ẩn có tin CỦA MÌNH (vừa gửi, hoặc tin lỗi khôi phục mới hơn
  // mốc chưa đọc) → mở luôn, không được giấu nội dung của chính người dùng sau banner.
  useEffect(() => {
    if (newRevealed || firstUnreadIndex < 0) return;
    const mineInHidden = messages
      .slice(firstUnreadIndex)
      .some((m) => m.contactId === info?.id);
    if (mineInHidden) setNewRevealed(true);
  }, [messages, firstUnreadIndex, newRevealed, info?.id]);

  // Bấm "n tin nhắn mới" → hiện vạch + các tin mới, rồi cuộn tới vạch.
  const revealNewMessages = () => {
    // Chặn ResizeObserver auto-stick đáy: reveal làm nội dung cao thêm đột ngột, nếu không tắt
    // thì RO sẽ nhảy thẳng xuống đáy (không animation) và cướp cuộn tới divider bên dưới.
    suppressAutoStick();
    setNewRevealed(true);
    requestAnimationFrame(() => {
      const el = document.getElementById("new-message-divider-anchor");
      el?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  // Gửi read receipt khi người dùng đọc tin nhắn (ở đáy màn hình)
  useEffect(() => {
    if (messages.length === 0 || !conversationId) return;
    // Tin mới còn đang ẩn (chưa bấm "n tin nhắn mới") → CHƯA coi là đã đọc.
    if (hasHiddenNew) return;

    // Nếu không hiện nút cuộn xuống nghĩa là đã ở cuối cùng
    if (!showScrollToBottom) {
      const currentLastMsg = messages[messages.length - 1];
      // Không có gì để đánh dấu đọc nếu tin cuối là của chính mình / chưa confirmed.
      if (!currentLastMsg?.id || currentLastMsg.contactId === info?.id) return;
      // Capture id đã narrow ra biến const — TS không giữ narrowing của property qua closure setTimeout.
      const lastMsgId = currentLastMsg.id;

      // Bỏ qua /read nếu hội thoại ĐÃ ĐỌC tới tin cuối: read horizon của self đã phủ tin
      // cuối → request thừa mỗi lần mở lại hội thoại đã đọc. Dùng cùng nguồn mốc với New
      // Message Divider (member.lastSeenTime, fallback conversation.lastSeenTime) để nhất
      // quán. Đọc qua ref → không cần thêm `conversation` vào deps.
      const conv = conversationRef.current;
      const selfMember = (conv?.members ?? []).find(
        (m) => m.contact?.id === info?.id,
      );
      const horizonRaw = selfMember?.lastSeenTime ?? conv?.lastSeenTime ?? null;
      const horizonMs = horizonRaw ? dayjs(horizonRaw).valueOf() : 0;
      if (dayjs(currentLastMsg.createdTime ?? "").valueOf() <= horizonMs) return;

      const timer = setTimeout(() => {
        const readTime = dayjs().toISOString();
        markRead(conversationId, lastMsgId, readTime).catch(console.error);
        // Clear unSeen + NÂNG read horizon của CHÍNH MÌNH ngay tại thời điểm đọc tin cuối.
        // - markConversationSeen: badge khớp list, tự sửa race "tin đến lúc đang xem nhưng
        //   isConversationActive=false → unSeen=true".
        // - updateMemberReadHorizon: đẩy selfMember.lastSeenTime tiến lên. Bắt buộc, nếu không
        //   khi rời rồi quay lại hội thoại (conversation cache staleTime=1h, không refetch),
        //   divider tính lại từ lastSeenTime CŨ → banner "n tin nhắn mới" hiện lại dù đã đọc.
        queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
          if (!old || !info?.id) return old;
          const seen = markConversationSeen(old, conversationId);
          return updateMemberReadHorizon(
            seen,
            conversationId,
            info.id,
            lastMsgId,
            readTime,
          );
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
    // Dep theo ID tin cuối (không phải cả mảng `messages`) → chỉ chạy lại khi tin cuối thực sự
    // đổi, tránh đặt lại timer + markRead thừa mỗi khi cache mutate (reaction/seen/confirm).
  }, [
    showScrollToBottom,
    messages[messages.length - 1]?.id,
    conversationId,
    queryClient,
    info?.id,
    hasHiddenNew,
  ]);

  const grouped = useMemo(
    () => groupMessagesByDate(renderedMessages),
    [renderedMessages],
  );
  const groupedEntries = Object.entries(grouped);

  /**
   * Rule sản phẩm: CHỈ hiển thị trạng thái tin nhắn (avatar người xem hoặc
   * icon Sent/Delivered) khi tin nhắn CUỐI CÙNG của conversation là của mình.
   * Nếu tin cuối là của người khác → KHÔNG hiển thị bất kỳ status nào.
   *
   * Pending message của mình cũng không thoả (chưa confirmed → chưa có id thật).
   */
  const allMessages = messages;
  const lastMessage =
    allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;
  const lastMessageIsMineConfirmed =
    !!lastMessage &&
    !!lastMessage.id &&
    lastMessage.contactId === info?.id &&
    !lastMessage.pending &&
    !lastMessage.failed;
  const lastMyMessageId = lastMessageIsMineConfirmed
    ? (lastMessage?.id ?? null)
    : null;

  // Tin cuối của conversation là của mình (tính cả pending). Dùng để reserve
  // sẵn chỗ cho slot receipt ngay khi tin còn đang gửi → khi icon Sent xuất
  // hiện lúc gửi thành công sẽ không đẩy lệch layout.
  const lastMessageIsMine =
    !!lastMessage && lastMessage.contactId === info?.id && !lastMessage.failed;

  /**
   * Map: messageId -> danh sách contact đã xem tin cuối (chỉ khi tin cuối là của mình).
   *
   * Vì rule chỉ cho hiện status ở tin cuối của conversation (và phải là của mình),
   * nên map này tối đa chỉ có 1 entry duy nhất là `lastMessage.id`.
   *
   * - Nếu tin cuối không phải của mình / pending / không tồn tại → map rỗng.
   * - Nếu tin cuối là của mình: avatar hiển thị cho các member khác có
   *   `lastSeenTime >= lastMessage.createdTime` (đã đọc tới tin cuối).
   *
   * Complexity: O(m) với m = số member khác trong conversation.
   */
  const seenContactsByMessageId = useMemo<Record<string, SeenContact[]>>(() => {
    const result: Record<string, SeenContact[]> = {};
    if (
      !lastMessageIsMineConfirmed ||
      !lastMessage?.id ||
      !lastMessage?.createdTime ||
      !info?.id
    ) {
      return result;
    }

    const otherMembers = (conversation?.members ?? []).filter(
      (m) => m.contact?.id && m.contact.id !== info.id && m.lastSeenTime,
    );
    if (otherMembers.length === 0) return result;

    const lastTime = dayjs(lastMessage.createdTime).valueOf();
    const lastId = lastMessage.id;

    for (const member of otherMembers) {
      const seenTime = dayjs(member.lastSeenTime!).valueOf();
      // Chỉ tính là "đã xem tin cuối" khi lastSeenTime >= createdTime của tin cuối
      if (seenTime >= lastTime) {
        if (!result[lastId]) result[lastId] = [];
        result[lastId].push(member.contact!);
      }
    }

    return result;
  }, [
    lastMessageIsMineConfirmed,
    lastMessage?.id,
    lastMessage?.createdTime,
    conversation?.members,
    info?.id,
  ]);

  return (
    <div className="chatbox-content relative flex h-full w-full flex-col justify-end overflow-hidden pb-4">
      <FetchingMoreMessages loading={isFetchingPreviousPage || isJumpingToTarget} />
      {/* Bước 1 của divider: text nhấp nháy báo có tin mới; bấm để hiện vạch + các tin mới. */}
      {hasHiddenNew && hiddenNewCount > 0 && (
        <button
          type="button"
          onClick={revealNewMessages}
          className="new-message-banner absolute bottom-[9%] left-1/2 z-30 -translate-x-1/2"
        >
          <i className="fa fa-arrow-down mr-2" />
          {hiddenNewCount} tin nhắn mới
        </button>
      )}
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={() => scrollToBottom("smooth")}
        className={`absolute bottom-[5%] right-[50%] z-20 transition-all duration-200
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-arrow-down"></div>
      </RelightBackground>
      <div
        ref={refChatContent}
        className="flex grow flex-col overflow-x-hidden overflow-y-scroll scroll-smooth p-4"
      >
        {/* Wrapper nội dung: grow để lấp đầy container (mt-auto trên group đầu đẩy tin xuống
            đáy khi ít tin); được ResizeObserver theo dõi để auto-stick đáy khi cao thêm async. */}
        <div ref={contentRef} className="flex grow flex-col">
        {groupedEntries.map(([date, blocks], groupIndex) => (
          <div
            key={date}
            // Group đầu tiên có mt-auto để đẩy nội dung xuống đáy khi ít tin nhắn
            className={`flex flex-col ${groupIndex === 0 ? "mt-auto" : ""}`}
          >
            <div className="text-3xs text-(--text-main-color-blur) rounded-4xl laptop:mb-8 pointer-events-none mx-auto w-fit bg-(--date-divider-bg) px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
              {formatDisplayDate(date)}
            </div>
            {blocks.map((block, blockIndex) => {
              const firstMessage = block.messages[0];
              // Key ỔN ĐỊNH theo tin đầu block (không dùng index): khi prepend trang cũ vào
              // cùng date-group, index của mọi block phía sau dịch đi → key=index sẽ REMOUNT
              // toàn bộ DOM tin nhắn (ảnh mất trạng thái loaded, chiều cao sập rồi nở lại
              // nhiều đợt) → phá scroll anchoring + làm anchor-restore đo sai. Tin pending
              // chưa có id thì fallback createdTime (chỉ nằm cuối danh sách, không bị prepend
              // ảnh hưởng).
              const blockKey =
                firstMessage.id ?? firstMessage.createdTime ?? blockIndex;
              if (firstMessage.type === "system") {
                // Tin hệ thống (ai đó được thêm vào group, ...) → hiển thị dạng label ở giữa
                return (
                  <div
                    key={blockKey}
                    className="rounded-4xl text-(--text-main-color-blur) pointer-events-none mx-auto mb-8 w-fit bg-(--date-divider-bg) px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                  >
                    {firstMessage.content}
                  </div>
                );
              }
              return (
                <div key={blockKey} className="mb-6 flex flex-col gap-4">
                  {block.messages.map((message) => (
                    <Fragment key={message.id}>
                      {firstUnreadId && message.id === firstUnreadId && (
                        <div
                          id="new-message-divider-anchor"
                          className="new-message-divider"
                        >
                          <span>Tin nhắn mới</span>
                        </div>
                      )}
                    <MessageContent
                      message={message}
                      // conversationId LẤY TỪ ROUTE PARAM (nguồn tin cậy, luôn có), KHÔNG lấy
                      // từ `conversation?.id` — conversation là lookup trong list cache, có thể
                      // undefined khi hội thoại chưa nằm trong trang list đã tải (deep-link, phân
                      // trang, hội thoại mới, race list↔messages). Khi đó `?? ""` → id rỗng, làm
                      // usePinMessage/useBookmark trong menu bị disable (enabled:!!id) → /pins,
                      // /bookmarks không được gọi cho những hội thoại đó (và vỡ poll/retry).
                      id={conversationId}
                      // Avatar và tên chỉ hiển thị ở tin đầu của block
                      showName={message === firstMessage}
                      showAvatar={message === firstMessage}
                      isLastFromMe={
                        lastMyMessageId !== null &&
                        message.id === lastMyMessageId
                      }
                      // Reserve chỗ slot receipt (kể cả lúc pending) để tránh
                      // layout shift khi icon Sent hiện ra sau khi gửi xong.
                      isLastMine={lastMessageIsMine && message === lastMessage}
                      // Pre-computed: tin này là điểm dừng đọc cuối của các member nào
                      seenContacts={
                        message.id
                          ? seenContactsByMessageId[message.id]
                          : undefined
                      }
                      getContainerRect={() =>
                        refChatContent.current?.getBoundingClientRect() ??
                        new DOMRect()
                      }
                    />
                    </Fragment>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
