import React, { useRef } from "react";
import CustomInput from "../common/CustomInput";

const ListFriend = ({ id, onclose }) => {
  const refProfileWrapper = useRef();

  return (
    <div ref={refProfileWrapper} className="h-[50rem] bg-white p-8">
      <CustomInput
        // ref={refUsername}
        type="text"
        label="Search for name"
        // value={username}
        onChange={(text) => {}}
      />
    </div>
  );
};

export default ListFriend;
