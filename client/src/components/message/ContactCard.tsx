import { SharedContactModel } from "../../types/message.types";

// Thẻ danh bạ được chia sẻ trong hội thoại (tin nhắn type = contact).
// Phase này: hiển thị thông tin liên hệ (avatar + tên). Mở chat trực tiếp từ card
// là hạn chế đã biết của giai đoạn hiện tại.
const ContactCard = ({ contact }: { contact?: SharedContactModel | null }) => {
  if (!contact) return null;

  const avatar =
    contact.avatar ||
    "https://ui-avatars.com/api/?name=" + encodeURIComponent(contact.name || "U");

  return (
    <div className="flex w-60 max-w-[75vw] items-center gap-3 rounded-2xl border border-(--border-color) bg-(--bubble-bg) p-3 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
      <img
        src={avatar}
        alt={contact.name}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-(--text-main-color)">{contact.name}</p>
        <p className="text-2xs flex items-center gap-1 text-(--text-main-color-blur)">
          <i className="fa-regular fa-address-card shrink-0" />
          <span className="truncate">Danh bạ được chia sẻ</span>
        </p>
      </div>
    </div>
  );
};

export default ContactCard;
