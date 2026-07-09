import { useCallback, useLayoutEffect, useRef, useState } from "react";
import useEventListener from "./useEventListener";

/**
 * Quản lý scroll của khung chat:
 * - Nút "scroll to bottom" khi user cuộn lên xa đáy.
 * - PREFETCH trang CŨ hơn khi còn cách đỉnh ~1 viewport (qua fetchPreviousPage của
 *   useInfiniteQuery) để giấu latency, GIỮ NGUYÊN vị trí đọc bằng cách NEO THEO DOM NODE
 *   của tin đầu danh sách (anchor) thay vì số học scrollHeight/offset.
 *
 * VÌ SAO NEO THEO DOM NODE (không dùng offset-tới-đáy như bản cũ):
 * - Offset chụp tại LÚC BẮT ĐẦU fetch bị stale: user vẫn cuộn tiếp trong lúc chờ mạng.
 * - scrollHeight tại thời điểm restore không đáng tin: ảnh/thẻ preview trong trang mới
 *   (hoặc block bị remount) chưa load nên chiều cao thiếu → mọi công thức dựa trên
 *   scrollHeight đều lệch, tệ nhất là clamp xuống đáy.
 * - Đo TRỰC TIẾP vị trí của cùng một DOM node (tin cũ nhất trước prepend) trước/sau khi
 *   DOM đổi thì miễn nhiễm cả hai vấn đề trên, và idempotent với scroll anchoring của
 *   trình duyệt (đo vị trí THỰC, không giả định trình duyệt đã bù hay chưa).
 */
export const useChatboxScroll = (
  hasPreviousPage: boolean,
  isFetchingPreviousPage: boolean,
  fetchPreviousPage: () => void,
  // id tin nhắn đầu danh sách (trang cũ nhất). Đổi = trang cũ vừa được prepend → restore scroll.
  firstMessageId: string | undefined,
  // Đổi hội thoại → huỷ prepend đang chờ của hội thoại cũ (tránh áp restore nhầm convo).
  conversationId: string,
) => {
  const refChatContent = useRef<HTMLDivElement>(null);
  // Wrapper bao toàn bộ nội dung tin nhắn — được ResizeObserver theo dõi để phát hiện
  // chiều cao NỘI DUNG tăng do tải bất đồng bộ (ảnh, thẻ preview link). Container cuộn
  // có chiều cao cố định nên tự nó không báo thay đổi này.
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // Theo dõi node thật để gắn scroll listener DETERMINISTIC (không chờ render phụ tình cờ).
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  // Người dùng đang ở/gần đáy? Cập nhật ở mỗi lần scroll THẬT của user. Mặc định true vì
  // lần đầu mở hội thoại luôn jump xuống đáy. Dùng làm gate cho auto-stick khi nội dung cao thêm.
  const atBottomRef = useRef(true);
  // scrollTop lần scroll trước — để phân biệt user CUỘN LÊN (scrollTop giảm) với các thay đổi
  // distance do nội dung cao thêm bên dưới / stickToBottom (scrollTop giữ nguyên hoặc tăng).
  const lastScrollTopRef = useRef(0);

  // ANCHOR-BASED PREPEND: khi trigger fetch trang cũ, ghi lại id tin ĐẦU danh sách hiện tại
  // (anchorId) + vị trí node đó so với đỉnh container (anchorOffset). anchorOffset được LÀM MỚI
  // ở mỗi scroll-event trong lúc chờ mạng → luôn phản ánh vị trí NGAY TRƯỚC khi prepend, không
  // stale dù user cuộn tiếp. Sau prepend, đo lại vị trí node → bù đúng delta thực đo được.
  // prevBottomOffset chỉ là fallback khi không tìm thấy anchor node (không kỳ vọng xảy ra).
  const pendingPrepend = useRef<{
    anchorId: string;
    anchorOffset: number | null;
    prevBottomOffset: number;
  } | null>(null);
  // Cho ResizeObserver bỏ qua ĐÚNG MỘT LẦN ngay sau prepend: effect restore chạy đồng bộ
  // (layout effect, trước paint) và xoá pendingPrepend ngay; RO callback fire SAU paint nên
  // guard `if (pendingPrepend)` không còn chặn được đợt cao-thêm do chính prepend gây ra.
  const skipStickOnceRef = useRef(false);
  // scrollTop kỳ vọng sau cú gán PROGRAMMATIC gần nhất (restore/stick). Scroll-event khớp giá
  // trị này là event do CODE phát, KHÔNG phải user cuộn → handleScroll bỏ qua logic đổi
  // atBottom + prefetch cho event đó. Đây là chốt chặn lỗi cũ: cú gán scrollTop của restore
  // phát scroll-event, rule "distance ≤ 80 → atBottom=true" nuốt lại thành true (hội thoại
  // ngắn), rồi ảnh trang 2 load async → RO stickToBottom → "load more tự cuộn xuống đáy".
  const expectedScrollTopRef = useRef<number | null>(null);

  // handleScroll cần đọc firstMessageId hiện tại khi capture anchor (callback memo hoá).
  const firstMessageIdRef = useRef(firstMessageId);
  firstMessageIdRef.current = firstMessageId;

  // Đổi hội thoại: huỷ prepend đang chờ của hội thoại trước (nếu không, restore sẽ áp lên
  // convo mới → nhảy vị trí sai). Reset atBottom vì convo mới sẽ jump xuống đáy.
  useLayoutEffect(() => {
    pendingPrepend.current = null;
    skipStickOnceRef.current = false;
    atBottomRef.current = true;
    lastScrollTopRef.current = 0;
    expectedScrollTopRef.current = null;
  }, [conversationId]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    atBottomRef.current = true;
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Tắt auto-stick đáy cho một thao tác cuộn CÓ CHỦ ĐÍCH tới vị trí KHÔNG PHẢI đáy (vd: reveal
  // tin mới → cuộn smooth tới divider). Khi reveal làm nội dung cao thêm đột ngột, ResizeObserver
  // sẽ thấy atBottom=true và stickToBottom() (gán scrollTop=scrollHeight, KHÔNG animation) → cướp
  // cuộn, "bay thẳng xuống đáy". Đặt atBottom=false để RO bỏ qua; skipStickOnce nuốt đúng đợt
  // cao-thêm ngay sau đó. User tự cuộn xuống đáy sau này thì handleScroll bật lại atBottom=true.
  const suppressAutoStick = useCallback(() => {
    atBottomRef.current = false;
    skipStickOnceRef.current = true;
  }, []);

  // Ghim tức thì xuống đáy (không animation) — dùng khi nội dung cao thêm do tải async
  // để tránh giật khi nhiều ảnh load liên tiếp.
  const stickToBottom = useCallback(() => {
    const el = refChatContent.current;
    if (!el) return;
    const prev = el.style.scrollBehavior;
    const before = el.scrollTop;
    el.style.scrollBehavior = "auto";
    el.scrollTop = el.scrollHeight;
    el.style.scrollBehavior = prev || "smooth";
    // Chỉ đánh dấu khi scrollTop THẬT SỰ đổi (không đổi → không có scroll-event nào để nuốt,
    // nếu vẫn set sẽ ăn nhầm event user kế tiếp).
    if (el.scrollTop !== before) expectedScrollTopRef.current = el.scrollTop;
  }, []);

  // Vị trí đỉnh anchor node so với đỉnh container (đo THẬT bằng getBoundingClientRect).
  const measureAnchorOffset = (el: HTMLElement, anchorId: string): number | null => {
    const anchorEl = document.getElementById(anchorId);
    if (!anchorEl) return null;
    return anchorEl.getBoundingClientRect().top - el.getBoundingClientRect().top;
  };

  const handleScroll = useCallback(() => {
    const el = refChatContent.current;
    if (!el) return;

    // Đang chờ trang cũ: làm mới vị trí anchor ở MỖI scroll — restore sẽ dùng vị trí
    // ngay-trước-prepend, không phải vị trí cũ lúc bắt đầu fetch (user có thể đã cuộn tiếp).
    const pending = pendingPrepend.current;
    if (pending) {
      const offset = measureAnchorOffset(el, pending.anchorId);
      if (offset !== null) pending.anchorOffset = offset;
      pending.prevBottomOffset = el.scrollHeight - el.scrollTop;
    }

    // Scroll-event do chính code phát (restore/stick vừa gán scrollTop)? So khớp giá trị kỳ vọng.
    // Event programmatic KHÔNG được đổi atBottom hay trigger prefetch — chỉ user thật mới được.
    const expected = expectedScrollTopRef.current;
    expectedScrollTopRef.current = null;
    const isProgrammatic = expected !== null && Math.abs(el.scrollTop - expected) <= 1;

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const prevTop = lastScrollTopRef.current;
    lastScrollTopRef.current = el.scrollTop;

    // Hiện nút scroll-to-bottom khi cách đáy ≥ 50% chiều cao container (cập nhật cả cho
    // programmatic scroll — nút phải phản ánh vị trí thực).
    setShowScrollToBottom(
      el.clientHeight !== 0 && distanceFromBottom >= el.clientHeight / 2,
    );

    if (isProgrammatic) return;

    // Cập nhật gate auto-stick (chỉ theo scroll THẬT của user):
    //  - Chạm/gần đáy (≤ 80px) → bám đáy.
    //  - CHỈ rời bám đáy khi user chủ động CUỘN LÊN (scrollTop giảm thật). Không rời chỉ vì
    //    distance dương: khi ảnh/preview load-async làm nội dung cao thêm bên dưới, stickToBottom
    //    đặt scrollTop lên đáy mới nhưng scroll-event chạy sau đọc scrollHeight MỚI hơn →
    //    distance dương giả.
    if (distanceFromBottom <= 80) {
      atBottomRef.current = true;
    } else if (el.scrollTop < prevTop - 2) {
      atBottomRef.current = false;
    }

    // PREFETCH-AHEAD: bắt đầu load trang cũ TRƯỚC khi user chạm đỉnh (còn cách đỉnh trong
    // ~1 viewport, floor 400px) để giấu network latency. Anchor-restore giữ nguyên vị trí đọc
    // kể cả khi prepend lúc user chưa ở đỉnh nên prefetch sớm là an toàn.
    //
    // !atBottomRef: CHỈ prefetch khi user đã RỜI đáy (đang thật sự xem lịch sử). Bắt buộc vì với
    // hội thoại NGẮN (tổng nội dung ≲ 2 viewport) thì scrollTop ở ĐÁY vẫn ≤ prefetchMargin →
    // nếu không chặn, prefetch nổ ngay khi user còn đứng ở đáy.
    const prefetchMargin = Math.max(400, el.clientHeight);
    if (
      el.scrollTop <= prefetchMargin &&
      !atBottomRef.current &&
      hasPreviousPage &&
      !isFetchingPreviousPage &&
      !pendingPrepend.current
    ) {
      const anchorId = firstMessageIdRef.current;
      if (anchorId) {
        pendingPrepend.current = {
          anchorId,
          anchorOffset: measureAnchorOffset(el, anchorId),
          prevBottomOffset: el.scrollHeight - el.scrollTop,
        };
        fetchPreviousPage();
      }
    }
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  // Đồng bộ node DOM vào state ngay sau commit để useEventListener gắn đúng vào container
  // (không attach nhầm window do ref.current=null ở render đầu).
  useLayoutEffect(() => {
    setScrollEl(refChatContent.current);
  }, []);

  useEventListener("scroll", handleScroll, scrollEl ?? undefined);

  // Auto-stick đáy khi CHIỀU CAO NỘI DUNG tăng do tải bất đồng bộ (ảnh / thẻ preview link
  // xuất hiện hoặc ảnh trong thẻ load xong). Chỉ ghim khi:
  //  - người dùng đang ở/gần đáy (atBottomRef) → không cướp vị trí khi đang đọc lịch sử;
  //  - KHÔNG đang prepend trang cũ (pendingPrepend) → tránh đè lên anchor-restore.
  // Nội dung cao thêm ở dưới KHÔNG phát sự kiện "scroll", nên ResizeObserver là cách bắt tin cậy.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      // RO fire TRƯỚC khi restore chạy (hiếm) → prepend đang treo, bỏ qua.
      if (pendingPrepend.current) return;
      // RO của chính đợt prepend vừa xong (restore đã bù vị trí) → tiêu thụ 1 lần, KHÔNG stick.
      if (skipStickOnceRef.current) {
        skipStickOnceRef.current = false;
        return;
      }
      if (!atBottomRef.current) return;
      stickToBottom();
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [stickToBottom]);

  // Sau khi trang cũ được prepend (firstMessageId đổi): khôi phục vị trí đọc bằng ANCHOR NODE.
  // Đo lại vị trí THẬT của tin từng-là-đầu-danh-sách rồi bù đúng phần nó bị đẩy đi — không phụ
  // thuộc scrollHeight (ảnh trang mới chưa load), không double-compensate với scroll anchoring
  // của trình duyệt (đo vị trí thực sau khi trình duyệt đã bù hay chưa đều cho cùng delta đúng).
  useLayoutEffect(() => {
    const el = refChatContent.current;
    const pending = pendingPrepend.current;
    if (!el || !pending) return;
    pendingPrepend.current = null;

    const before = el.scrollTop;
    el.style.scrollBehavior = "auto";
    const anchorEl = document.getElementById(pending.anchorId);
    if (anchorEl && pending.anchorOffset !== null) {
      const newOffset =
        anchorEl.getBoundingClientRect().top - el.getBoundingClientRect().top;
      const delta = newOffset - pending.anchorOffset;
      if (delta !== 0) el.scrollTop = before + delta;
    } else {
      // Fallback (không kỳ vọng xảy ra): giữ khoảng-cách-tới-đáy như bản cũ.
      el.scrollTop = el.scrollHeight - pending.prevBottomOffset;
    }
    el.style.scrollBehavior = "smooth";
    // Chỉ nuốt scroll-event nếu scrollTop thật sự đổi (không đổi → không có event).
    if (el.scrollTop !== before) expectedScrollTopRef.current = el.scrollTop;

    // Đợt content cao-thêm do prepend sẽ dội tới RO NGAY SAU paint — đánh dấu để RO bỏ qua,
    // không kéo xuống đáy (vị trí đọc đã được bù đúng ở trên).
    skipStickOnceRef.current = true;
    // User vừa cuộn lên để load lịch sử → TUYỆT ĐỐI không coi là đang ở đáy, bất kể khoảng cách
    // hình học còn lại là bao nhiêu (hội thoại ngắn có thể vẫn ≤ 80px → chính là lỗi cũ "load
    // more tự cuộn xuống đáy" khi ảnh trang 2 load async kích stickToBottom). atBottom chỉ bật
    // lại khi USER thật sự cuộn về đáy (handleScroll, nhánh non-programmatic).
    atBottomRef.current = false;
    lastScrollTopRef.current = el.scrollTop;
  }, [firstMessageId]);

  // Fetch trang cũ kết thúc mà firstMessageId KHÔNG đổi (lỗi mạng / trang rỗng) → restore ở trên
  // không chạy, pendingPrepend kẹt lại → khoá vĩnh viễn prefetch + auto-stick. Dọn tại đây.
  // Phải khai báo SAU effect restore: khi fetch THÀNH CÔNG, restore (chạy trước theo thứ tự khai
  // báo) đã tiêu thụ pending rồi → effect này thấy null, không dọn nhầm.
  useLayoutEffect(() => {
    if (!isFetchingPreviousPage && pendingPrepend.current) {
      pendingPrepend.current = null;
    }
  }, [isFetchingPreviousPage]);

  return {
    refChatContent,
    contentRef,
    bottomRef,
    scrollToBottom,
    suppressAutoStick,
    showScrollToBottom,
  };
};
