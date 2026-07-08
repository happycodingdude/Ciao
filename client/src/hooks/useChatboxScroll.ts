import { useCallback, useLayoutEffect, useRef, useState } from "react";
import useEventListener from "./useEventListener";

/**
 * Quản lý scroll của khung chat:
 * - Nút "scroll to bottom" khi user cuộn lên xa đáy.
 * - PREFETCH trang CŨ hơn khi còn cách đỉnh ~1 viewport (qua fetchPreviousPage của
 *   useInfiniteQuery) để giấu latency, GIỮ NGUYÊN vị trí đọc bằng cách bù chênh lệch scrollHeight
 *   trong useLayoutEffect (chống nhảy).
 *
 * Không còn tự quản refPage / ghi cache thủ công — pagination do React Query lo.
 */
export const useChatboxScroll = (
  hasPreviousPage: boolean,
  isFetchingPreviousPage: boolean,
  fetchPreviousPage: () => void,
  // id tin nhắn đầu danh sách (trang cũ nhất). Đổi = trang cũ vừa được prepend → restore scroll.
  firstMessageId: string | undefined,
  // Đổi hội thoại → huỷ prepend đang chờ của hội thoại cũ (tránh áp delta scroll nhầm convo).
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

  // Người dùng đang ở/gần đáy? Cập nhật ở mỗi lần scroll thật. Mặc định true vì lần đầu
  // mở hội thoại luôn jump xuống đáy. Dùng làm gate cho auto-stick khi nội dung cao thêm.
  const atBottomRef = useRef(true);
  // scrollTop lần scroll trước — để phân biệt user CUỘN LÊN (scrollTop giảm) với các thay đổi
  // distance do nội dung cao thêm bên dưới / stickToBottom (scrollTop giữ nguyên hoặc tăng).
  const lastScrollTopRef = useRef(0);

  // Lưu KHOẢNG CÁCH TỪ ĐÁY (scrollHeight - scrollTop) ngay trước khi prepend để khôi phục vị trí
  // sau khi DOM cao thêm. Dùng offset-tới-đáy (TUYỆT ĐỐI) thay vì delta scrollHeight (TƯƠNG ĐỐI):
  // trình duyệt bật `overflow-anchor: auto` mặc định nên khi tin cũ được chèn Ở TRÊN, NÓ ĐÃ tự dời
  // scrollTop để giữ khung nhìn ổn định TRƯỚC khi effect restore chạy. Nếu restore lại cộng thêm
  // delta (scrollHeight - prevHeight) thì bị BÙ HAI LẦN → scrollTop vọt quá → clamp XUỐNG ĐÁY (đúng
  // lỗi "load more tự cuộn xuống đáy"). Gán tuyệt đối scrollTop = scrollHeight - prevBottomOffset là
  // IDEMPOTENT: cho ra đúng vị trí dù trình duyệt đã tự bù hay chưa.
  const pendingPrepend = useRef<{ prevBottomOffset: number } | null>(null);
  // Cho ResizeObserver bỏ qua ĐÚNG MỘT LẦN ngay sau prepend. Lý do: effect restore-scroll chạy
  // ĐỒNG BỘ (layout effect, trước paint) và xoá pendingPrepend=null NGAY; còn RO callback fire SAU
  // paint → lúc đó pendingPrepend đã null nên guard `if (pendingPrepend)` không còn chặn được đợt
  // cao-thêm do prepend. Vị trí sau prepend đã được restore giữ đúng rồi → RO KHÔNG được stick
  // xuống đáy ở đợt này (nếu không: load-more khi atBottomRef còn true sẽ giật xuống đáy).
  const skipStickOnceRef = useRef(false);

  // Đổi hội thoại: huỷ prepend đang chờ của hội thoại trước. Nếu không, effect restore-scroll
  // (chạy khi firstMessageId của convo mới load xong) sẽ áp delta scrollHeight của convo CŨ
  // → nhảy vị trí sai trên convo mới. Reset atBottom vì convo mới sẽ jump xuống đáy.
  useLayoutEffect(() => {
    pendingPrepend.current = null;
    skipStickOnceRef.current = false;
    atBottomRef.current = true;
    lastScrollTopRef.current = 0;
  }, [conversationId]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    atBottomRef.current = true;
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Ghim tức thì xuống đáy (không animation) — dùng khi nội dung cao thêm do tải async
  // để tránh giật khi nhiều ảnh load liên tiếp.
  const stickToBottom = useCallback(() => {
    const el = refChatContent.current;
    if (!el) return;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollTop = el.scrollHeight;
    el.style.scrollBehavior = prev || "smooth";
  }, []);

  const handleScroll = useCallback(() => {
    const el = refChatContent.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const prevTop = lastScrollTopRef.current;
    lastScrollTopRef.current = el.scrollTop;
    // Cập nhật gate auto-stick MỘT CÁCH BỀN VỮNG (chống race scroll-event vs ResizeObserver):
    //  - Chạm/gần đáy (≤ 80px) → luôn bám đáy.
    //  - CHỈ rời bám đáy khi user chủ động CUỘN LÊN (scrollTop giảm thật). Không rời chỉ vì
    //    distance dương: khi ảnh/thẻ preview load-async làm nội dung cao thêm bên dưới,
    //    stickToBottom đặt scrollTop lên đáy mới (đồng bộ) nhưng scroll-event chạy sau lại đọc
    //    scrollHeight MỚI hơn → distance dương giả. Nếu lật atBottomRef=false ở đây, ResizeObserver
    //    sẽ ngừng bám đáy → kẹt giữa chừng khi reload/gửi/nhận tin có preview. scrollTop chỉ giảm
    //    khi user tự cuộn lên (load-async/stick chỉ giữ nguyên hoặc tăng scrollTop) nên đây là
    //    tín hiệu "rời đáy" tin cậy duy nhất.
    if (distanceFromBottom <= 80) {
      atBottomRef.current = true;
    } else if (el.scrollTop < prevTop - 2) {
      atBottomRef.current = false;
    }
    // Hiện nút scroll-to-bottom khi cách đáy ≥ 50% chiều cao container
    setShowScrollToBottom(
      el.clientHeight !== 0 && distanceFromBottom >= el.clientHeight / 2,
    );

    // PREFETCH-AHEAD: bắt đầu load trang cũ TRƯỚC khi user chạm đỉnh, khi còn cách đỉnh trong
    // khoảng ~1 viewport (floor 400px). Mục tiêu: giấu network latency — tới lúc user thật sự
    // cuộn tới đỉnh thì trang cũ đã được prepend sẵn, không phải đứng đợi. Cơ chế bù scrollHeight
    // (theo firstMessageId) giữ nguyên vị trí đọc kể cả khi prepend lúc user chưa ở đỉnh, nên
    // prefetch sớm là an toàn. Các guard (hasPreviousPage / !isFetchingPreviousPage /
    // !pendingPrepend) chống fetch chồng + chain-load vô tận.
    //
    // !atBottomRef: CHỈ prefetch khi user đã RỜI đáy (đang thật sự xem lịch sử). Bắt buộc vì với
    // hội thoại NGẮN (tổng nội dung ≲ 2 viewport) thì scrollTop ở ĐÁY vẫn ≤ prefetchMargin →
    // nếu không chặn, prefetch sẽ nổ ngay khi user còn đứng ở đáy (atBottom=true). Trang cũ chèn
    // ở trên có ảnh / thẻ preview tải bất đồng bộ làm chiều cao tăng NHIỀU ĐỢT; skipStickOnce chỉ
    // nuốt được 1 đợt, các đợt sau gặp atBottom=true → stick xuống đáy = đúng lỗi "load more tự cuộn
    // xuống đáy". Chặn ở đây khiến mọi lần prefetch đều xảy ra lúc atBottom=false → restore đặt
    // atBottom=false → RO không bao giờ stick dù trang cũ tải bao nhiêu đợt ảnh đi nữa.
    const prefetchMargin = Math.max(400, el.clientHeight);
    if (
      el.scrollTop <= prefetchMargin &&
      !atBottomRef.current &&
      hasPreviousPage &&
      !isFetchingPreviousPage &&
      !pendingPrepend.current
    ) {
      pendingPrepend.current = { prevBottomOffset: el.scrollHeight - el.scrollTop };
      fetchPreviousPage();
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
  //  - KHÔNG đang prepend trang cũ (pendingPrepend) → tránh đè lên logic bù scroll ở trên.
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

  // Sau khi trang cũ được prepend (firstMessageId đổi): khôi phục vị trí đọc để không nhảy.
  // Gán TUYỆT ĐỐI theo khoảng-cách-tới-đáy đã lưu (idempotent với overflow-anchor của trình duyệt —
  // xem chú thích ở khai báo pendingPrepend). KHÔNG dùng `+= delta` vì trình duyệt đã tự dời scrollTop
  // trước khi effect này chạy → cộng thêm delta sẽ bù hai lần và clamp xuống đáy.
  useLayoutEffect(() => {
    const el = refChatContent.current;
    const pending = pendingPrepend.current;
    if (!el || !pending) return;
    el.style.scrollBehavior = "auto";
    el.scrollTop = el.scrollHeight - pending.prevBottomOffset;
    el.style.scrollBehavior = "smooth";
    pendingPrepend.current = null;
    // Đợt content cao-thêm do prepend sẽ dội tới RO NGAY SAU paint — đánh dấu để RO bỏ qua nó,
    // không kéo xuống đáy (vị trí đọc đã được bù đúng ở trên).
    skipStickOnceRef.current = true;
    // QUAN TRỌNG: tính lại atBottomRef theo VỊ TRÍ THỰC sau khi bù. User vừa cuộn LÊN để load-more
    // nên gần như chắc chắn KHÔNG ở đáy → atBottom=false. Nếu bỏ bước này, atBottomRef có thể đang
    // stale=true (do trước đó ảnh/thẻ preview của TRANG ĐẦU tải xong liên tục gọi stickToBottom →
    // scroll-event đặt lại atBottom=true). Khi đó các đợt ảnh của trang vừa nạp / trang đầu còn
    // đang tải sẽ tiếp tục dội RO và bị hiểu là "đang ở đáy" → giật xuống đáy (đúng lỗi còn sót).
    // lastScrollTopRef cũng phải đồng bộ để lần scroll thật kế tiếp không so với mốc cũ (nhỏ) mà
    // hiểu nhầm hướng cuộn.
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    atBottomRef.current = distanceFromBottom <= 80;
    lastScrollTopRef.current = el.scrollTop;
  }, [firstMessageId]);

  return {
    refChatContent,
    contentRef,
    bottomRef,
    scrollToBottom,
    showScrollToBottom,
  };
};
