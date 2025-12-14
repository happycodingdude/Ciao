import React from "react";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import { FriendItemProps } from "../../../types";
import FriendCtaButton from "./FriendCtaButton";

const FriendItem = (props: FriendItemProps) => {
  const { friend } = props;

  return (
    <div
      key={friend.id}
      // data-key={friend.id}
      className="flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-(--bg-color-extrathin)"
    >
      <ImageWithLightBoxAndNoLazy
        src={friend.avatar}
        className="aspect-square phone:w-20"
        // imageClassName="bg-[size:160%]"
        slides={[
          {
            src: friend.avatar,
          },
        ]}
      />
      <div className="flex h-full max-w-[50%] flex-col items-start">
        <p className="font-medium">{friend.name}</p>
        <CustomLabel
          className="text-(--text-main-color-normal)"
          title={friend.bio}
        />
        {/* <p className="text-[var(--text-main-color-normal)]">{friend.bio}</p> */}
      </div>
      <FriendCtaButton {...props} />
    </div>
  );
};

export default FriendItem;
