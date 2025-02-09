import { useEffect, useState } from "react";

const useToggleChatDetail = () => {
  const [toggle, setToggle] = useState<string | null>(
    localStorage.getItem("toggleChatDetail"),
  );
  useEffect(() => {
    localStorage.setItem("toggleChatDetail", toggle);
  }, [toggle]);
  return { toggle, setToggle };
};

export default useToggleChatDetail;
