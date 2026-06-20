import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import useLoading from "../../hooks/useLoading";
import { createDirectChat } from "../../services/friend.service";
import { ContactModel } from "../../types/friend.types";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type Props = {
  friends: ContactModel[];
};

const HomeOnlineFriends = ({ friends }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoading } = useLoading();

  // Chặn double-click khi đang tạo direct chat cho một contact cụ thể
  const [openingId, setOpeningId] = useState<string | null>(null);

  const openChat = async (contact: ContactModel) => {
    if (openingId) return;

    // Đã có direct conversation → điều hướng thẳng, không gọi API
    if (contact.directConversation) {
      router.navigate({
        to: "/conversations/$conversationId",
        params: { conversationId: contact.directConversation },
      });
      return;
    }

    if (!contact.id) return;

    try {
      setOpeningId(contact.id);
      setLoading(true);
      const res = await createDirectChat(contact.id);
      if (!res?.conversationId) return;
      // Conversation mới chưa có trong cache → invalidate để list/route load đúng
      await queryClient.invalidateQueries({ queryKey: ["conversation"] });
      router.navigate({
        to: "/conversations/$conversationId",
        params: { conversationId: res.conversationId },
      });
    } finally {
      setOpeningId(null);
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-col gap-2">
      <h2 className="text-(--text-main-color) flex shrink-0 items-center gap-2 font-semibold">
        <i className="fa-solid fa-circle text-(--online-color) text-[10px]" />
        Friends online
        <span className="text-(--text-main-color-blur) text-xs font-normal">
          ({friends.length})
        </span>
      </h2>

      {friends.length === 0 ? (
        <p className="text-(--text-main-color-blur) bg-(--bg-color-extrathin) flex flex-1 items-center justify-center rounded-2xl p-4 text-center text-sm">
          None of your friends are online right now.
        </p>
      ) : (
        <div className="hide-scrollbar flex min-h-0 flex-1 items-start gap-4 overflow-x-auto pb-1">
          {friends.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => openChat(contact)}
              disabled={openingId === contact.id}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5 disabled:opacity-50"
              title={`Chat with ${contact.name ?? ""}`}
            >
              <div className="relative">
                <ImageWithLightBoxAndNoLazy
                  src={contact.avatar}
                  className="ring-(--online-color) pointer-events-none aspect-square w-14 ring-2"
                  circle
                  slides={[{ src: contact.avatar ?? "" }]}
                />
                <span className="bg-(--online-color) absolute -bottom-0.5 -right-0.5 aspect-square w-3.5 rounded-full border-2 border-white" />
              </div>
              <CustomLabel
                className="text-(--text-main-color) text-center text-[11px]"
                title={contact.name}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeOnlineFriends;
