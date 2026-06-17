import { FriendItemProps } from "../../types/base.types";
import { ContactModel } from "../../types/friend.types";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import FriendCtaButton from "../friend/FriendCtaButton";

type Props = {
  contact: ContactModel;
  friendAction?: FriendItemProps["friendAction"];
  onClose?: FriendItemProps["onClose"];
  // Chỉ tab bạn bè/online cần chấm presence; tab requests/add bỏ qua cho gọn.
  showPresence?: boolean;
};

// Row contact dùng chung cho mọi tab của Connections. Tái dùng FriendCtaButton để
// nút hành động (Chat/Accept/Cancel/Add) tự render đúng theo friendStatus.
const ConnectionContact = ({
  contact,
  friendAction,
  onClose,
  showPresence,
}: Props) => {
  return (
    <div className="hover:bg-(--bg-color-extrathin) flex items-center gap-4 rounded-2xl px-3 py-3">
      <div className="relative shrink-0">
        <ImageWithLightBoxAndNoLazy
          src={contact.avatar ?? undefined}
          className="pointer-events-none aspect-square w-12"
          circle
          slides={[{ src: contact.avatar ?? "" }]}
        />
        {showPresence && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 aspect-square w-3.5 rounded-full border-2 border-white
              ${contact.isOnline ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
          />
        )}
      </div>

      <div className="flex min-w-0 grow flex-col">
        <p className="text-(--text-main-color) truncate font-medium">
          {contact.name}
        </p>
        <CustomLabel
          className="text-(--text-main-color-normal) text-2xs"
          title={contact.bio}
        />
      </div>

      <FriendCtaButton
        friend={contact}
        friendAction={friendAction}
        onClose={onClose}
      />
    </div>
  );
};

export default ConnectionContact;
