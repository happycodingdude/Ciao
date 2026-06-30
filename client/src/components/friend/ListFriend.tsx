import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";
import { getContacts } from "../../services/friend.service";
import { OnCloseType } from "../../types/base.types";
import { ContactModel } from "../../types/friend.types";
import blurImage from "../../utils/blurImage";
import ModalSearchInput from "../common/ModalSearchInput";
import FriendItem from "./FriendItem";

const ListFriend = (props: OnCloseType) => {
  const { onClose } = props;

  const refInput = useRef<(HTMLInputElement & { reset?: () => void }) | undefined>(undefined);

  const [contacts, setContacts] = useState<ContactModel[]>([]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  useEffect(() => {
    blurImage(".list-friend-container");
  }, [contacts]);

  const fetchContacts = async (name: string) => {
    const contacts = await getContacts(name);
    setContacts(contacts ?? []);
  };

  const debounceDropDown = useCallback(debounce(fetchContacts, 100), []);

  const findContact = (name: string) => {
    debounceDropDown(name);
  };

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
    userId?: string | null,
  ): void => {
    setContacts((current) => {
      return current.map((contact) => {
        if (contact.id !== userId) return contact;
        return {
          ...contact,
          friendId: id,
          friendStatus: status,
        } as ContactModel;
      });
    });
  };

  return (
    <>
      <ModalSearchInput
        inputRef={refInput}
        placeholder="Search people by name"
        onChange={(e) => {
          findContact(e.target.value);
        }}
      />
      <div className="list-friend-container hide-scrollbar text-(--text-main-color) border-(--border-color) bg-(--search-bg-color) flex grow flex-col overflow-y-auto rounded-xl border scroll-smooth">
        {contacts.map((item) => (
          <FriendItem
            key={item.id}
            friend={item}
            friendAction={handleFriendAction}
            onClose={onClose}
          />
        ))}
      </div>
    </>
  );
};

export default ListFriend;
