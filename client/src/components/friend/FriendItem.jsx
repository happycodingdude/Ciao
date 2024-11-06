import React from "react";
import ImageWithLightBox from "../common/ImageWithLightBox";
import FriendCtaButton from "./FriendCtaButton";

const FriendItem = (props) => {
  const { key, friend, setContacts, onClose } = props;

  return (
    <div
      key={key}
      // data-key={friend.id}
      className="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-[var(--bg-color-light)]"
    >
      <ImageWithLightBox
        src={friend.avatar}
        className="aspect-square rounded-2xl laptop:w-[5rem]"
        spinnerClassName="laptop:bg-[size:2rem]"
        imageClassName="bg-[size:150%]"
        slides={[
          {
            src: friend.avatar,
          },
        ]}
      />
      <div className="flex h-full flex-col items-start">
        <p className="font-medium">{friend.name}</p>
        <p className="text-[var(--text-main-color-normal)]">{friend.Bio}</p>
      </div>
      <FriendCtaButton
        friend={friend}
        setContacts={setContacts}
        onClose={onClose}
      />
    </div>
  );
};

export default FriendItem;
