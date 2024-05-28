import { debounce } from "lodash";
import React, { useCallback, useRef, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomInput from "../common/CustomInput";
import ImageWithLightBox from "../common/ImageWithLightBox";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const ListFriend = ({ id, onclose }) => {
  const refProfileWrapper = useRef();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState([]);

  function fetchDropdownOptions(key) {
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYNAME.replace(
        "{name}",
        key,
      ),
      token: token,
    }).then((res) => {
      setContacts(res.data);
    });
  }

  const debounceDropDown = useCallback(
    debounce((nextValue) => fetchDropdownOptions(nextValue), 500),
    [],
  );

  const findContact = (name) => {
    setName(name);
    debounceDropDown(name);
  };

  return (
    <div
      ref={refProfileWrapper}
      className="laptop:text-full flex flex-col bg-white p-10 pt-12 laptop:h-[60rem] desktop:h-[80rem] desktop:text-[80%]"
    >
      <CustomInput
        // ref={refUsername}
        type="text"
        label="Search for name"
        value={name}
        onChange={(text) => {
          findContact(text);
        }}
      />
      <div className="hide-scrollbar mt-8 flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth">
        {contacts.map((item, i) => (
          <div
            data-key={item.id}
            className="flex cursor-pointer items-center gap-4 rounded-2xl p-4 hover:bg-[var(--main-color-thin)]"
          >
            <ImageWithLightBox
              src={item.avatar ?? ""}
              className={`pointer-events-none aspect-square w-[5rem] rounded-2xl shadow-[0px_0px_10px_-7px_var(--shadow-color)]`}
            />
            <div className="flex flex-col">
              <p>{item.name}</p>
              <p className="text-[var(--text-main-color-blur)]">{item.name}</p>
            </div>
            {
              {
                new: (
                  <AddButton
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-sm desktop:h-[4rem] desktop:text-md"
                    id={item.id}
                  />
                ),
                request_received: (
                  <AcceptButton
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-sm desktop:h-[4rem] desktop:text-md"
                    id={item.friendId}
                  />
                ),
                request_sent: (
                  <CancelButton
                    className="!mr-0 w-auto px-[1rem] laptop:h-[3rem] laptop:text-sm desktop:h-[4rem] desktop:text-md"
                    id={item.friendId}
                  />
                ),
                friend: "",
              }[item.friendStatus]
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListFriend;
