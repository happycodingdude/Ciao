import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { blurImage, HttpRequest } from "../../common/Utility";
import CustomInput from "../common/CustomInput";
import FriendItem from "./FriendItem";

const ListFriend = (props) => {
  const { onClose } = props;

  const refInput = useRef();

  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    refInput.current.focus();
  }, []);

  useEffect(() => {
    blurImage(".list-friend-container");
  }, [contacts]);

  function fetchDropdownOptions(key) {
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYNAME.replace(
        "{name}",
        key,
      ),
    }).then((res) => {
      setContacts(res.data);
    });
  }

  const debounceDropDown = useCallback(
    debounce((nextValue) => fetchDropdownOptions(nextValue), 100),
    [],
  );

  const findContact = (name) => {
    debounceDropDown(name);
  };

  return (
    <div className="flex flex-col p-10 pt-12 laptop:h-[45rem] desktop:h-[80rem]">
      <CustomInput
        type="text"
        placeholder="Search for name"
        reference={refInput}
        onChange={(e) => {
          findContact(e.target.value);
        }}
      />
      <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col overflow-y-scroll scroll-smooth text-[var(--text-main-color)]">
        {contacts.map((item, i) => (
          <FriendItem
            key={item.id}
            friend={item}
            setContacts={setContacts}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default ListFriend;
