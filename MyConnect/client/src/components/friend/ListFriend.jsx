import React, { useRef } from "react";

const ListFriend = ({ id, onclose }) => {
  const refProfileWrapper = useRef();

  return (
    <div ref={refProfileWrapper} className="h-[50rem] w-full bg-white"></div>
  );
};

export default ListFriend;
