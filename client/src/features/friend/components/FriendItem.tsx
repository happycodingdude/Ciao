import React from "react";
import ImageWithLightBox from "../../../components/ImageWithLightBox";
import { FriendItemProps } from "../../../types";
import FriendCtaButton from "./FriendCtaButton";

const FriendItem = (props: FriendItemProps) => {
  const { friend } = props;

  return (
    <div
      key={friend.id}
      // data-key={friend.id}
      className="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-[var(--bg-color-extrathin)]"
    >
      <ImageWithLightBox
        src={friend.avatar}
        className="aspect-square rounded-2xl laptop:w-[5rem]"
        // imageClassName="bg-[size:160%]"
        slides={[
          {
            src: friend.avatar,
          },
        ]}
      />
      <div className="flex h-full flex-col items-start">
        <p className="font-medium">{friend.name}</p>
        <p className="text-[var(--text-main-color-normal)]">{friend.bio}</p>
      </div>
      <FriendCtaButton {...props} />
    </div>
  );
};

export default FriendItem;
