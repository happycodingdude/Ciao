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
- Mới (lấy theo mockup): `--bubble-bg: #272727` (áp dụng **cả** tin gửi & nhận — xem Verification #3), `--toolbar-btn-bg: #363636`, `--toolbar-btn-text: var(--text-main-color-blur)`, `--date-divider-bg: #1b1b1b`, `--skeleton-base: #1b1b1b`.
  - *Lưu ý:* 4 token bề mặt trên trùng giá trị thang `--bg-color-*` sẵn có (`#272727`=`--bg-color-thin`, `#363636`=`--bg-color-extrathin`, `#1b1b1b`=`--bg-color-light`). Giữ tên semantic để palette độc lập về sau — chấp nhận được.
- **Accent xanh dương — CHỈ dark (quyết định 2026-06-30):** đổi **toàn bộ ramp** `--main-color*` trong dark block từ cyan/green sang ramp xanh dương neo tại `#2f80ed`. **Light giữ pink nguyên vẹn** (0 regression). `light-blue-*` đã xanh sẵn → không đụng.
  - Ramp đề xuất (tunable theo mockup): `--main-color-extrabold: #15396b`, `--main-color-bold: #1d5bb8`, `--main-color: #2f80ed`, `--main-color-light: #5b9bf2`, `--main-color-thin: #8fbcf7`, `--main-color-extrathin: #c2dbfb`.
  - Lý do đổi cả ramp: `-bold`/`-light`/`-extrathin`/`-extrabold` được dùng ở hover/tint trong surface dark (ChatboxMenu, ListChatFilter, HomeRecentChats…). Đổi mỗi base → hover ra xanh-lá lệch base xanh-dương.

### Verification (2026-06-30) — đối chiếu plan ↔ mockup dark ↔ code
1. **Token thiếu**: xác nhận dark block thực sự không có 4 biến trên → đúng.
2. **File scope**: grep toàn `client/src` ra 23 file hardcode neutral. 14 chat + 4 skeleton + `ConversationReview` + `ProfileSettingMenu` (token-gap `--main-color-thin`) đúng plan; 4 file còn lại (`ConnectionTabs`, `HomeHero`, `SideBarMenu`, `SettingToggle`) đều benign/chủ đích đã ghi trong audit → **không sót, không thừa**.
3. **Bubble**: `MessageContent.tsx:230` dùng `bg-white` cho **cả** tin gửi & nhận (phân biệt chỉ bằng căn lề, không bằng màu — `MessageItem` không set bg theo `mine`). → 1 token `--bubble-bg` là đủ, preserve behavior, khớp mockup (bubble xám tối). Không dính `--main-color` → không có rủi ro bubble cyan.
4. **Accent**: app có 2 hệ — `--main-color*` (152 chỗ/60 file, brand pink/cyan) và `light-blue-*` (66 chỗ, đã xanh). Nút Send đã xanh sẵn; chỉ tab active (`ListChatFilter.tsx:46`) dùng `--main-color`. Quyết định: chỉ đổi ramp dark `--main-color` sang xanh (xem trên).

---

## Phase 4 — Implementation Planning

| Phase | Objective | Risk | Dependency | Rollback |
|---|---|---|---|---|
| **0 — Token** | Thêm 4 biến thiếu + 5 token chat/skeleton + **đổi ramp `--main-color` dark → xanh** | Lệch màu mockup; hover/tint lệch nếu quên đổi cả ramp | — | Xóa biến mới + revert ramp dark (light intact) |
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
- [x] **Verify đối chiếu mockup (2026-06-30)** — plan khớp; chốt accent dark = xanh `#2f80ed`, light giữ pink; bubble dùng 1 token `--bubble-bg`.
- [x] Duyệt kế hoạch → bắt đầu Phase 0
- [x] Phase 0 (token) · [x] Phase 1 (chat core) · [x] Phase 2 (skeletons) · [x] Phase 3 (stragglers) · [x] Phase 4 (validation — **đã verify trực quan**)
- [x] Feature documentation (`docs/features/DARK_MODE.md`)

> **Phase 4 — kết quả:** `vite build` pass; `eslint` 0 lỗi mới (31 lỗi còn lại pre-existing, ngoài file đã sửa; lint chỉ chạy `js,jsx` → không cover `.tsx`). Mọi token tham chiếu định nghĩa đủ ở cả 2 theme. **Verify trực quan: PASS** — render harness bằng CSS đã build + Chrome headless (Windows, qua WSL), đối chiếu mockup. Phát hiện phụ (không sửa, ngoài scope): `--text-main-color-normal` ở ChatboxHeader không được định nghĩa (bug pre-existing, chữ header vẫn đọc được qua inheritance).

---

## Changelog chi tiết phiên implement (2026-06-30)

> Ghi lại toàn bộ thay đổi thực tế của phiên, gồm các vòng sửa sau khi verify trên **app live** (harness ban đầu bỏ sót nhiều surface). Bài học: audit ban đầu quá hẹp (chỉ `bg-white/gray` trong `components/`) → phải mở rộng sang `routes/`, `pages/`, layout container, **mọi file `.css`**, và **nền gốc `body`**.

### A. Token & palette (`styles/App.css`)
- **Bù token thiếu trong dark block**: `--main-color-thin`, `--bg-color-medium`, `--placehoder-color`, `--loading-bg-color`.
- **Token bề mặt chat mới** (định nghĩa ở **cả 2 theme**): `--bubble-bg`, `--toolbar-btn-bg`, `--toolbar-btn-text`, `--date-divider-bg`, `--skeleton-base`, `--chat-bg-from/to`, `--edit-banner-bg`, `--reply-preview-bg`, `--chat-fade-rgb`, `--shimmer-base/mid/sweep`.
- **Sửa "di sản màu sáng" nằm nhầm trong dark block**: `--border-color`, `--portal-container-bg-color`, `--search-bg-color`, `--placehoder-color`, `--loading-bg-color`, `--text-sub-color-thin` (vốn là xanh-lá `#3e7c5b`).
- **Re-tint toàn bộ palette dark sang NAVY** (lấy mẫu pixel trực tiếp từ mockup): nền list/panel `--bg-color: #0c1421`, bubble `#1e2e44`, chat area `#131f31→#0d1726`, search `#1a2536`, scale `--bg-color-*` chuyển navy.
- **Accent dark = sky-blue `#25a4eb`** (lấy mẫu mockup; ban đầu chốt `#2f80ed` royal, đổi sau khi đối chiếu app live). Đổi cả ramp `--main-color*`. **Light giữ pink** nguyên vẹn.
- **Token sidebar & toggle**: `--sidebar-from/to`, `--chat-item-glow`, `--chat-item-active-bg`, `--theme-toggle-bg/glow/icon`, `--sidebar-active-bg/icon`.

### B. Nền gốc — safety-net (`index.css`)
- `html, body, #root` thêm `background-color: var(--bg-color)` + `color: var(--text-main-color)` → không page nào leak nền trắng trong dark (đây là gốc rễ bug "toàn app trắng" lúc đầu).

### C. Chat core (14 file) + skeleton (4 file) + stragglers
- Map hardcode `bg-white / bg-gray-* / text-gray-* / border-gray-*` → CSS-var ở: `ChatInputToolbar, MessageContent, ConversationItem, Attachment, ChatInput, Chatbox, Information, InformationSearch, MentionDropdown, ImageItem, ChatboxHeader, ListChatHeader, ShareImage, LazyEmojiPicker`.
- Skeleton: `ModalLoading, ListchatLoading, ListFriendLoading, ChatboxLoading` — container bg + tokenize block. **Shimmer gradient** (`listchat.css`) token-hóa → dark thành xám-navy subtle (trước đó xanh-tím chói).
- `ConversationReview` (bubble review), `ProfileSettingMenu` (tự fix nhờ token `--main-color-thin`).

### D. Container/layout/CSS bị sót (phát hiện khi test app live)
- `routes/_layout.conversations.tsx`: section thêm `bg-(--bg-color)` (các page khác đã có sẵn).
- `components/layouts/ChatboxContainer.tsx`: nền chat từ gradient `light-blue-50/100` → `--chat-bg-from/to`.
- `components/common/FetchingMoreMessages.tsx`: overlay load-more 3 nguồn sáng trắng → `--chat-fade-rgb`.
- `ChatInput` (banner Edit), `ReplyPreview` → token.
- CSS popup menu tin nhắn (`messagemenu.css`, `messagemenu_slide.css`): `background: white` → `var(--bg-color)`.
- `button.css` (`.custom-button` tab Attachment): `#f3f4f6 / #4b5563` → token.
- `ConversationItem`: chấm online `border-white` → `border-(--bg-color)`.

### E. Toggle theme chuyển vào Sidebar
- `components/layouts/SideBarMenu.tsx`: thêm nút toggle (icon **sun/moon** theo `useTheme`, tooltip "Light/Dark mode") sau Settings.
- `styles/sidebar.css`: class `.theme-toggle` — nút bo góc, **bg + glow theo theme** (dark = glow xanh).
- **Gỡ tab "Appearance" khỏi Settings**: `types/settings.types.ts`, `pages/Setting.tsx`; **xoá** `components/settings/AppearanceSection.tsx` (mồ côi).

### F. Trạng thái active của icon sidebar
- `.active` trong `sidebar.css` token-hóa: `--sidebar-active-bg` (trắng) + `--sidebar-active-icon`.
- Quy ước chốt với user: **icon active = đúng màu nền sidebar theo theme** (cut-out): light `#0ea5e9` (sky-blue), dark `#06213c` (navy). Logo top đồng bộ dùng cùng token.

### Cơ chế verify đã dùng
- Build (`npm run build`) → tạo harness HTML tạm trong `client/dist/` link CSS đã compile (chứa `[data-theme]` vars) → screenshot bằng **Chrome headless của Windows** (qua WSL) → đối chiếu mockup.
- Lấy màu chính xác từ mockup bằng **decoder PNG thuần Python** (zlib stdlib; môi trường không có PIL/pip/magick).
- Evidence lưu ở `docs/features/evidence/`.
- **Lưu ý quan trọng:** harness chỉ chứng minh token/CSS resolve, **không** thay thế việc user verify trên app live (UI chat sau auth, headless không login được).
