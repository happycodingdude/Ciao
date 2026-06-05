# Tối ưu CSS Client

## Mục đích
Dọn dẹp toàn bộ CSS trong `client/src` để loại bỏ bugs, dead code, và code trùng lặp mà không thay đổi UI.

## Các thay đổi

### Bugs / Global side effects đã fix
| File | Vấn đề | Fix |
|------|--------|-----|
| `sidebar.css` | `body { font-family: "Inter" }` ghi đè font toàn cục từ index.css | Xóa |
| `Loading.css` | `body { background-color: #eee }` ghi đè theme background | Xóa |
| `index.css` | `@keyframes waving-text` định nghĩa 2 lần (translateY -7rem bị orphaned) | Xóa cái đầu |
| `index.css` | `svg { cursor: pointer }` duplicate 2 lần liền nhau | Xóa cái thứ 2 |
| `index.css` | `.waving-text` plain class trùng với `@utility waving-text` | Xóa plain class |
| `index.css` | `$.hover` typo trong `@utility base-icon-sm` (không hoạt động) | Sửa thành `&:hover` |
| `chatinput.css` | `@keyframes shimmer` conflict với keyframe cùng tên trong index.css | Đổi tên thành `shimmer-slide` |

### Dead code đã xóa

**index.css** (15 utilities không được dùng):
- `@utility blurred-div` + `.blurred-div img` selectors
- `@utility message-item`, `chat-container`, `messages-container`
- `@utility close-button`, `error-show`, `centering`
- `@utility grid-transition`, `mention-input`, `relight-background`
- `@utility base-icon-lg`, `nolazy-image`
- `@utility lazy-background`, `lazy-background-sm`
- `@utility attachment-filter-container/item/input/text`
- `@utility font-be-vn-bold`

**listchat.css**: `.glass-effect`, `.gradient-bg`, `.version-4`, `.version-5`

**imageitem.css**: `.glitch-text` + `@keyframes glitch`, `.pulse-glow` + `@keyframes pulse-glow`, `.vintage-paper`

**sidebar.css**: Google Fonts Poppins import không dùng

**listchat.css**: Google Fonts Poppins import không dùng

### Orphaned selectors đã gom vào @utility block
- `.gradient-item::after` → bên trong `@utility gradient-item`
- `.video-call-container button` → bên trong `@utility video-call-container`

### Fix hardcoded colors (dark mode support)
**information.css**: `.conversation-action` background thay từ `#f3f4f6`/`#e5e7eb` (hardcoded) sang `var(--bg-color-thin)`/`var(--bg-color-light)` để hỗ trợ dark mode.

### Dọn comments
Xóa toàn bộ commented-out code và section comments không cần thiết trong tất cả các file.

## Kết quả
- index.css: ~1063 → 813 dòng (-24%)
- sidebar.css: 128 → 108 dòng (-16%)
- listchat.css: 82 → 47 dòng (-43%)
- imageitem.css: 129 → 87 dòng (-33%)
- Không thay đổi UI hay behavior
