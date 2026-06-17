import { FriendItemProps } from "../../types/base.types";
import { ContactModel } from "../../types/friend.types";
import ConnectionContact from "./ConnectionContact";
import ConnectionEmpty from "./ConnectionEmpty";

type Props = {
  incoming: ContactModel[];
  outgoing: ContactModel[];
  friendAction?: FriendItemProps["friendAction"];
};

type SectionProps = {
  title: string;
  icon: string;
  contacts: ContactModel[];
  friendAction?: FriendItemProps["friendAction"];
};

const Section = ({ title, icon, contacts, friendAction }: SectionProps) => {
  if (contacts.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-(--text-main-color) flex items-center gap-2 font-semibold">
        <i className={`fa-solid ${icon} text-(--main-color-bold)`} />
        {title}
        <span className="bg-(--main-color-bold) flex aspect-square min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white">
          {contacts.length}
        </span>
      </h2>
      <div className="bg-(--bg-color) flex flex-col rounded-2xl border border-(--border-color) p-2">
        {contacts.map((contact) => (
          <ConnectionContact
            key={contact.id}
            contact={contact}
            friendAction={friendAction}
          />
        ))}
      </div>
    </section>
  );
};

const ConnectionRequests = ({ incoming, outgoing, friendAction }: Props) => {
  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <ConnectionEmpty
        icon="fa-user-clock"
        title="No pending requests"
        hint="Friend requests you receive or send will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Received"
        icon="fa-user-plus"
        contacts={incoming}
        friendAction={friendAction}
      />
      <Section
        title="Sent"
        icon="fa-paper-plane"
        contacts={outgoing}
        friendAction={friendAction}
      />
    </div>
  );
};

export default ConnectionRequests;
