# Áp dụng Dark Mode toàn app — Kế hoạch chi tiết

> MODE: PLANNING · Token-based theming (tận dụng hệ CSS-var sẵn có).
> Ngày: 2026-06-29. Trạng thái: **CHỜ DUYỆT trước khi code**.
> Mục tiêu UI tham chiếu: mockup dark mode trang Conversations (do product cung cấp).

---

## Phase 1 — Goal Clarification

- **Business goal**: Dark mode đồng nhất toàn bộ app, khớp mockup → trải nghiệm nhất quán, không còn "vùng trắng" gây chói khi bật dark.
- **Technical goal**: Mọi bề mặt/chữ chạy qua CSS-var theme (`--bg-*`, `--text-*`, `--border-*`…); loại bỏ hardcode màu trung tính sáng (`bg-white`, `bg-gray-*`, `text-gray-*`, `text-black`).
- **Success criteria**:
  - Bật dark → **0** vùng sáng lạc (white/gray) trên mọi trang.
  - Light mode **không regression** (token chỉ thêm, không sửa block light).
  - `vite build` + `eslint` pass; không Console error / Network lỗi liên quan.
  - Đối chiếu trực quan trang Conversations khớp mockup.
- **Constraint**:
  - Chỉ đổi class màu → CSS-var; **không** đổi layout/behavior/logic.
  - Giữ các chỗ trắng **chủ đích**: logo container, knob của toggle, `text-white`/`bg-white/xx` trên nền gradient hoặc nút màu.
- **Scope**:
  - **Chính**: cụm Conversations/Chat + Loading skeletons (shared).
  - **Phụ**: pane review của Notifications, menu Profile, biến theme còn thiếu.
  - **Ngoài scope (đã dark-ready)**: Auth, Home, Connections, Settings (core), Profile section.
- **Timeline / scale**: 1 đợt, 5 phase tuần tự (0→4); ~19 file.

---

## Phase 2 — Current State Analysis

### Cơ chế dark mode hiện tại
- Theme set qua `data-theme="dark"|"light"` trên `documentElement` (`hooks/useTheme.ts`), persist `localStorage`.
- Màu theme hóa bằng **CSS variables** ở `client/src/styles/App.css` (`[data-theme="dark"]` / `[data-theme="light"]`).
- Component "dark-ready" = dùng biến (`bg-(--bg-color)`, `text-(--text-main-color)`…). Component **chưa apply** = hardcode màu trung tính sáng → giữ nguyên sáng khi bật dark.

### Audit theo trang

| Trang | Trạng thái | Ghi chú |
|---|---|---|
| Auth (Signin/Signup/Forgot/Authentication) | ✅ Dark-ready | Toàn bộ form dùng CSS-var |
| Home (`_layout.index`) | ✅ Dark-ready | Chỉ `bg-white/10`, `text-white` trên gradient — benign |
| Connections | ✅ Dark-ready | Chỉ `bg-white/25` tab active — benign |
| Settings | ✅ Dark-ready | Chỉ knob toggle `bg-white` — đúng chủ đích |
| Profile (menu) | ⚠️ 1 lỗi | Dùng `--main-color-thin` **thiếu trong dark block** → vỡ màu |
| Notifications | ⚠️ 1 chỗ | `ConversationReview.tsx`: bong bóng review `bg-white` |
| **Conversations / Chat** | ❌ **Chưa apply** | Khối lớn nhất (chi tiết dưới) |
| **Loading skeletons** (shared) | ❌ **Chưa apply** | `bg-gray-200`/`bg-white` → nháy sáng khi loading |
| Sidebar layout | ⚠️ 1 chỗ | `SideBarMenu.tsx` logo `bg-white` (giữ chủ đích) |

### Technical debt — file hardcode cần sửa

**Chat core (14 file):**
`ChatInputToolbar.tsx`, `MessageContent.tsx`, `ConversationItem.tsx`, `Attachment.tsx`, `ChatInput.tsx`, `Chatbox.tsx`, `Information.tsx`, `InformationSearch.tsx`, `MentionDropdown.tsx`, `ImageItem.tsx`, `ChatboxHeader.tsx`, `ListChatHeader.tsx`, `ShareImage.tsx`, `LazyEmojiPicker.tsx`.

**Loading skeletons (4 file):**
`ModalLoading.tsx`, `ListchatLoading.tsx`, `ListFriendLoading.tsx`, `ChatboxLoading.tsx`.

**Khác:** `ConversationReview.tsx`, `ProfileSettingMenu.jsx`.

### Lỗ hổng token (`App.css`)
Dark block **thiếu** biến mà light có: `--main-color-thin` (đang vỡ ở Profile), `--bg-color-medium`, `--placehoder-color`, `--loading-bg-color`.

---

## Phase 3 — Solution Design *(BẮT BUỘC)*

1. **Architecture proposal**: Token-based — bổ sung token còn thiếu + token mới cho bề mặt chat/skeleton vào `[data-theme="dark"]`, sau đó map class hardcode → `*-(--var)`.
2. **Component responsibility**: Component **không** giữ giá trị màu, chỉ tham chiếu token. Nguồn màu duy nhất = `App.css`.
3. **Data flow**: `useTheme` → set `data-theme` trên `<html>` → CSS-var cascade → class `*-(--var)` ở component.
4. **Scaling strategy**: Thêm theme mới (vd high-contrast) = thêm 1 block biến, không đụng component.
5. **Deployment impact**: Thuần CSS/class — **không** đụng API/DB/build config. Deploy như static FE bình thường.
6. **Operational complexity**: Thấp. Không thêm runtime cost (CSS-var native). Rollback theo từng file.
7. **Trade-off analysis**: Token-based đồng bộ hệ hiện có (nhất quán, sửa 1 nguồn) đổi lấy việc phải thêm token mới — chi phí thấp, đúng pattern → chọn.

### Token bổ sung (Phase 0)
- Thiếu → thêm vào dark block: `--main-color-thin`, `--bg-color-medium`, `--placehoder-color`, `--loading-bg-color`.
- Mới (lấy theo mockup): `--bubble-received-bg: #272727`, `--toolbar-btn-bg: #363636`, `--toolbar-btn-text: var(--text-main-color-blur)`, `--date-divider-bg: #1b1b1b`, `--skeleton-base: #1b1b1b`.

---

## Phase 4 — Implementation Planning

| Phase | Objective | Risk | Dependency | Rollback |
|---|---|---|---|---|
| **0 — Token** | Thêm 4 biến thiếu + 5 token chat/skeleton vào dark block | Lệch màu mockup | — | Xóa biến mới (light intact) |
| **1 — Chat core** (14 file) | Map hardcode → var khớp mockup | Đụng nhầm chỗ trắng chủ đích | Phase 0 | Revert per-file |
| **2 — Skeletons** (4 file) | Hết nháy trắng khi loading | Tương phản skeleton dark | Phase 0 | Revert per-file |
| **3 — Stragglers** | `ConversationReview`, `ProfileSettingMenu` (+ xác nhận giữ logo/knob) | Nhỏ | Phase 0 | Revert per-file |
| **4 — Validation** | Build + lint + Playwright dark/light | — | Phase 1–3 | — |

Thứ tự thực thi: **0 → 1 → 2 → 3 → 4**.

---

## Phase 5 — Risk Evaluation

| Loại | Đánh giá | Phòng ngừa |
|---|---|---|
| Backward compatibility (light regression) | Rủi ro **chính** | Token chỉ *thêm*, không sửa light block; verify light song song |
| Visual regression (dark) | Trung bình | Đối chiếu trực tiếp mockup qua Playwright |
| Migration risk | Không | FE-only, không state/DB |
| Downtime risk | Không | Static deploy |
| Data inconsistency | Không | Không đụng dữ liệu |
| Operational overhead | Không | CSS-var native, zero runtime cost |

---

## Phase 6 — Final Recommendation

- **Recommended approach**: Token-based, 5 phase tuần tự (0→4). Sửa class màu → CSS-var, giữ chỗ trắng chủ đích.
- **Rejected alternatives**:
  - **Tailwind `dark:` variant**: trộn 2 hệ theme với CSS-var hiện có → inconsistent, phải sửa nhiều hơn, lệch chuẩn codebase.
  - **Override global** `[data-theme=dark] .bg-white { … }`: fragile, đè cả chỗ cố ý trắng → bug khó lường.
  - **Sửa inline hex từng chỗ**: không scale, tái tạo nợ kỹ thuật.
- **Long-term maintainability impact**: 1 nguồn màu duy nhất; đổi palette / thêm theme = sửa 1 block biến. Giảm rủi ro lệch màu giữa các component.

---

## Phase 7 — Documentation

- Tài liệu kế hoạch này = output Phase 7 của PLANNING.
- Khi **implement xong** (chuyển sang MODE: FRONTEND): bắt buộc tạo thêm **feature documentation** theo `prompts/documentation/principles.md` (mô tả tính năng dark mode ở mức nghiệp vụ — mục đích, hành vi chuyển theme, phạm vi, hạn chế — không nêu file/class/kỹ thuật).

### Trạng thái
- [ ] Duyệt kế hoạch → bắt đầu Phase 0
- [ ] Phase 0 (token) · [ ] Phase 1 (chat core) · [ ] Phase 2 (skeletons) · [ ] Phase 3 (stragglers) · [ ] Phase 4 (validation)
- [ ] Feature documentation (sau implement)
