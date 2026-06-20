import { ContactModel } from "../../types/friend.types";
import { FriendItemProps } from "../../types/base.types";
import FriendItem from "../friend/FriendItem";

type Props = {
  requests: ContactModel[];
  friendAction: FriendItemProps["friendAction"];
};

const HomePendingRequests = ({ requests, friendAction }: Props) => {
  return (
    <section className="flex min-h-0 flex-col gap-2">
      <h2 className="text-(--text-main-color) flex shrink-0 items-center gap-2 font-semibold">
        <i className="fa-solid fa-user-clock text-(--main-color-bold)" />
        Friend requests
        {requests.length > 0 && (
          <span className="bg-(--danger-text-color) flex aspect-square w-5 items-center justify-center rounded-full text-[10px] font-medium text-white">
            {requests.length}
          </span>
        )}
      </h2>

      {requests.length === 0 ? (
        <p className="text-(--text-main-color-blur) bg-(--bg-color-extrathin) flex flex-1 items-center justify-center rounded-2xl p-4 text-center text-sm">
          No pending friend requests.
        </p>
      ) : (
        <div className="bg-(--bg-color) border-(--border-color) hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-2xl border p-2">
          {requests.map((contact) => (
            <FriendItem
              key={contact.id}
              friend={contact}
              friendAction={friendAction}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomePendingRequests;
