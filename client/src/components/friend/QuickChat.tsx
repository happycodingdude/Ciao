import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import useEventListener from "../../hooks/useEventListener";
import { useDirectMessage } from "../../hooks/useDirectMessage";
import { ContactModel, QuickChatProps } from "../../types/friend.types";
import CustomContentEditable from "../common/CustomContentEditable";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import FriendCtaButton from "./FriendCtaButton";

const QuickChat = (props: QuickChatProps) => {
  const { rect, offset, profile, onClose } = props;

  const router = useRouter();
  const { sendToContact } = useDirectMessage();

  const refQuickProfile = useRef<HTMLDivElement>(null);
  const refInput = useRef<HTMLDivElement>(null);

  const [innerFriend, setInnerFriend] = useState<ContactModel | undefined>(profile);

  // Đồng bộ innerFriend khi prop profile thay đổi (chọn thành viên khác trong group)
  useEffect(() => {
    setInnerFriend(profile);
  }, [profile]);

  useEffect(() => {
    // Không cần tính toán vị trí nếu chưa có profile hoặc chưa có rect click
    if (!innerFriend || !rect) return;

    if (refInput.current) {
      refInput.current.textContent = "";
      refInput.current.focus();
    }

    if (!refQuickProfile.current) return;

    // Tính toán vị trí dọc: căn giữa với element được click, nhưng không vượt ra ngoài viewport
    let offsetTop = rect.top - refQuickProfile.current.offsetHeight / 3;
    const maxTopPosition =
      window.innerHeight + window.scrollY - refQuickProfile.current.offsetHeight;
    offsetTop = Math.min(offsetTop, maxTopPosition);

    // Nếu tính ra âm (gần top của viewport) → snap về 0 thay vì bị khuất
    refQuickProfile.current.style.top = offsetTop < 0 ? "0px" : offsetTop + "px";
    // Vị trí ngang: cách phải một khoảng bằng độ rộng panel Information
    refQuickProfile.current.style.right = `${window.scrollY + (offset ?? 0)}px`;
  }, [innerFriend, rect]);

  const closeQuickProfileOnKey = useCallback((e: Event) => {
    // Escape → đẩy panel ra ngoài viewport (slide off)
    if ((e as KeyboardEvent).key === "Escape") {
      if (refQuickProfile.current) refQuickProfile.current.style.right = "-40rem";
    }
  }, []);
  useEventListener("keydown", closeQuickProfileOnKey);

  const closeQuickProfileOnClick = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    // Click trong panel hoặc click vào item trong member list → giữ panel mở
    if (
      target.closest(".quick-profile") ||
      target.closest(".information-members")
    )
      return;
    // Click ra ngoài → slide panel ra ngoài viewport
    if (refQuickProfile.current) refQuickProfile.current.style.right = "-40rem";
  }, []);
  useEventListener("click", closeQuickProfileOnClick);

  // Không render khi chưa có profile được chọn
  if (!profile) return null;

  const chat = async () => {
    const message = refInput.current?.textContent ?? "";
    await sendToContact(
      innerFriend!,
      { type: "text", content: message },
      {
        // Prefetch data để navigation vào conversation diễn ra mượt không bị loading
        prefetch: true,
        onNavigate: (convId) =>
          router.navigate({ to: `/conversations/${convId}` }),
      },
    );
    onClose?.();
  };

  const keydownBindingFn = (e: React.KeyboardEvent<HTMLElement>) => {
    // Enter không Shift → gửi tin; Shift+Enter → xuống dòng trong quick chat
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chat();
    }
  };

  const handleFriendAction = (
    id?: string | null,
    status?: "friend" | "request_sent" | "request_received" | "new" | null,
  ): void => {
    setInnerFriend((current) => ({
      ...current!,
      friendId: id ?? undefined,
      // null status → undefined (không có quan hệ bạn bè, tránh lưu null vào state)
      friendStatus: status === null ? undefined : status,
    }));
  };

  return (
    <div
      ref={refQuickProfile}
      className="quick-profile -right-160 laptop:w-70 fixed aspect-[1/0.9] rounded-lg"
    >
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute right-[5%] top-[5%]">
          <FriendCtaButton
            friend={innerFriend}
            friendAction={handleFriendAction}
          />
        </div>
        <div className="bg-(--light-blue-300) basis-[40%] rounded-t-lg"></div>
        <div className="bg-(--light-blue-400) relative flex grow flex-col gap-4 rounded-b-lg px-4 pt-8">
          <div className="bg-(--light-blue-400) absolute -top-10 left-6 rounded-[50%] p-2">
            <ImageWithLightBoxAndNoLazy
              src={innerFriend?.avatar ?? undefined}
              className="loaded bg-size-[170%] laptop:w-15 aspect-square cursor-pointer rounded-[50%]"
              slides={[{ src: innerFriend?.avatar ?? "" }]}
            />
          </div>
          <p className="text-sm font-medium">{innerFriend?.name}</p>
          <div className="bg-(--bg-color) rounded-lg py-2">
            <CustomContentEditable
              ref={refInput}
              className=" px-2"
              onKeyDown={keydownBindingFn}
              quickChat
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickChat;
