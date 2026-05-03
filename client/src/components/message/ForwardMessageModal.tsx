import { useEffect, useRef, useState } from "react";
import { useDirectMessage } from "../../hooks/useDirectMessage";
import useFriend from "../../hooks/useFriend";
import { ContactModel } from "../../types/friend.types";
import { PendingMessageModel } from "../../types/message.types";
import { isPhoneScreen } from "../../utils/getScreenSize";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ListFriendLoading from "../common/ListFriendLoading";

const ForwardMessageModal = ({
  message,
  forward,
  directContact,
}: {
  message: PendingMessageModel;
  forward?: boolean;
  directContact?: string;
}) => {
  const { type, content, attachments } = message;

  const { sendToContact } = useDirectMessage();
  const { data, isLoading, isRefetching } = useFriend();

  const refInput = useRef<HTMLInputElement | undefined>(undefined);

  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>(
    data
      ?.filter((item) => item.contact.id !== directContact)
      .map((item) => item.contact) ?? [],
  );
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(
      data
        .filter((item) => item.contact.id !== directContact)
        .map((item) => item.contact),
    );
    refInput.current?.focus();
  }, [data]);

  const send = async (contact: ContactModel) => {
    setSentIds((prev) => new Set(prev).add(contact.id ?? ""));
    await sendToContact(contact, {
      type: type ?? "",
      content,
      attachments,
      isForwarded: forward ?? false,
    });
  };

  return (
    <>
      <CustomInput
        type="text"
        placeholder="Search for name"
        inputRef={refInput}
        onChange={(e) => {
          if (e.target.value === "")
            setMembersToSearch((data ?? []).map((item) => item.contact));
          else
            setMembersToSearch((current) =>
              current.filter((item) =>
                (item.name ?? "")
                  .toLowerCase()
                  .includes(e.target.value.toLowerCase()),
              ),
            );
        }}
      />
      <div
        className={`relative flex grow gap-8 ${isPhoneScreen() ? "flex-col" : "flex-row"}`}
      >
        {isLoading || isRefetching ? (
          <ListFriendLoading />
        ) : (
          <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col overflow-y-scroll scroll-smooth">
            {membersToSearch?.map((item) => {
              const isSent = sentIds.has(item.id ?? "");
              return (
                <div
                  key={item.id}
                  className="information-members flex w-full items-center gap-4 rounded-lg p-[.7rem]"
                >
                  <ImageWithLightBoxAndNoLazy
                    src={item.avatar ?? undefined}
                    className="phone:w-12 laptop:w-16 pointer-events-none aspect-square"
                    circle
                    slides={[{ src: item.avatar ?? "" }]}
                    onClick={() => {}}
                    local
                  />
                  <CustomLabel
                    title={item.name}
                    className="pointer-events-none"
                  />
                  <CustomButton
                    className={`text-2xs ${isSent ? "pointer-events-none opacity-50" : ""}`}
                    width={4}
                    gradientWidth={isPhoneScreen() ? "115%" : "110%"}
                    gradientHeight={isPhoneScreen() ? "130%" : "120%"}
                    rounded="3rem"
                    title="Send"
                    onClick={() => send(item)}
                    sm
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ForwardMessageModal;
