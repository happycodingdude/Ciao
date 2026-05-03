# Comment Logic Điều Kiện — Client Codebase

## Mục đích

Thêm comment vào tất cả các logic điều kiện (if-else, switch-case, ternary, conditional render) trong codebase client để ghi lại lý do xử lý, giúp developer đọc hiểu nhanh mà không phải trace ngược context.

---

## Phạm vi thực hiện

### Hooks
| File | Logic được comment |
|---|---|
| `hooks/useChatInputKeyboard.ts` | ArrowDown/Up wrap-around, Enter in mention vs send, isEmpty tracking, @ trigger, Escape/Space close, Ctrl+Space manual trigger, mention text filter |
| `hooks/useChatboxScroll.ts` | lockScroll purpose, hasMore+el guard, prepend order, scroll height delta restoration, showScrollToBottom threshold, scrollTop===0 → fetch older messages |
| `hooks/useDirectMessage.ts` | Existing vs new conversation branching, prefetch, isDeleted, optimistic update, background API call |
| `hooks/useSendMessage.ts` | text vs media lastMessage, hasMedia attachment init, three attachment cache cases, delay 500ms anti-flicker, confirm randomId, attachment confirm by index |
| `hooks/useLocalStorage.ts` | JSON vs plain string detection, null→removeItem, string vs JSON.stringify |
| `hooks/usePresencePing.ts` | Duplicate interval guard, immediate ping on focus, visible→start/hidden→stop |
| `hooks/usePinMessage.ts` | Guard conditions, toggle pin direction |
| `hooks/useWebRTC.ts` | Camera permission error, null candidate = gathering complete, remote stream reset, addTrack, targetUser guard, stopCamera cleanup order |

### Utils
| File | Logic được comment |
|---|---|
| `utils/notificationHandlers.ts` | Switch event dispatch, exists→update vs prepend, unSeen only when !isActive, isActive→update message cache, invalidateQueries for inactive, reaction sync, pin sync |
| `utils/notificationCacheHelpers.ts` | Param override fallback, prepend for new conv, falsy field skip, membersUpdater call, duplicate message guard, reaction init, today bucket prepend |
| `utils/directMessageHelpers.ts` | Reaction init, media-only → filename text, pendingId assignment, three attachment cache cases |
| `utils/contentEditableUtils.ts` | addSpace for mention separation, data-mention vs display text, BR/DIV/P handling, null char return |
| `lib/fetch.ts` | No-retry on refresh URL, 401 only, refreshToken check, update Authorization header, clear credentials and redirect on refresh failure, FormData → no Content-Type |

### Components
| File | Logic được comment |
|---|---|
| `components/message/MessageContent.tsx` | null guard, isSelf flex-row-reverse, avatar block for others only, showAvatar/showName, forwarded > reply > normal priority, "You" vs sender name, pin badge, pending → no context menu |
| `components/message/MessageMenu.tsx` | Click-through, null guard for copy, mine vs contact for reply, above/below direction, transformOrigin, pinning disable, orange pin icon, pin/unpin text |
| `components/friend/QuickChat.tsx` | Profile sync, offsetTop clamp, panelRef offset, Escape slide off, click-outside, null render guard, Enter vs Shift+Enter, null→undefined friendStatus |
| `context/SignalContext.tsx` | Throw on missing provider, Connected state guard, info.id dependency wait, isMounted anti-memory-leak |
| `components/layouts/ListChatContainer.tsx` | lockScroll purpose, append order, empty response → refHasMore=false, distanceFromBottom ≤ 50, isDeleted filter, centering calculation |
| `components/conversation/Chatbox.tsx` | groupMessagesByDate (same sender block, mt-auto alignment), initial load vs new message scroll, system vs user message render |
| `components/conversation/ChatInput.tsx` | Conversation reset on id change, caret after file add, selectedIndex mention scroll (item above/below viewport), content="" → "media" type, click outside → close mention, phone vs desktop max-width |
| `components/conversation/CreateGroupChatModal.tsx` | chooseAvatar null guard, input reset, toggleMember toggle logic, empty guard before create, file→upload vs null, tempId→real id replace, search reset, phone vs desktop layout |
| `components/conversation/AddMembersModal.tsx` | Toggle logic, empty guard, search reset, existingMemberIds derivation |
| `components/conversation/InformationMembers.tsx` | Admin sort first, selfId disable click, panelRef offset, "friend"→undefined friendStatus |
| `components/conversation/InformationAttachments.tsx` | Cache null guard, flatten buckets + limit slice, empty→reset, isLoading/hasData/empty tristate, image vs file slide src |
| `components/conversation/FriendPickerList.tsx` | isExisting pointer-events-none, blue icon condition, "Joined" label, isPhoneScreen layout |
| `components/conversation/ConversationItem.tsx` | otherMember derivation, isOnline logic, active class, group vs direct avatar/name, isActive/unSeen text color, lastMessageTime null guard |

---

## Nguyên tắc comment được áp dụng

- Chỉ comment **WHY** (lý do), không comment **WHAT** (code đã tự mô tả qua tên biến/hàm)
- Không viết docstring hoặc comment block dài
- Comment ngắn gọn: 1 dòng, đặt ngay trước logic liên quan
- JSX comments dùng `{/* ... */}`, không đặt comment bên trong `className` string (gây CSS IntelliSense false positive)
