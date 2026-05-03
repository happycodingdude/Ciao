import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useFriend from "../../hooks/useFriend";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { addMembers } from "../../services/conv.service";
import { OnCloseType } from "../../types/base.types";
import { ConversationCache } from "../../types/conv.types";
import { ContactModel } from "../../types/friend.types";
import { MessageCache, PendingMessageModel } from "../../types/message.types";
import blurImage from "../../utils/blurImage";
import { isPhoneScreen } from "../../utils/getScreenSize";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import FriendPickerList from "./FriendPickerList";

const AddMembersModal = ({ onClose }: OnCloseType) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching } = useFriend();
  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find((c) => c.id === conversationId);

  const refInput = useRef<HTMLInputElement & { reset?: () => void }>(undefined);
  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>([]);
  const [membersToAdd, setMembersToAdd] = useState<ContactModel[]>([]);

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(data.map((item) => item.contact));
    refInput.current?.focus();
    blurImage(".list-friend-container");
  }, [data]);

  const existingMemberIds = (conversation?.members ?? []).map((m) => m.contact?.id ?? "");

  const toggleMember = (item: ContactModel) => {
    setMembersToAdd((prev) =>
      // Đã có trong danh sách → bỏ chọn; chưa có → thêm vào
      prev.some((m) => m.id === item.id)
        ? prev.filter((m) => m.id !== item.id)
        : [...prev, { id: item.id, name: item.name, avatar: item.avatar }],
    );
  };

  const removeMemberToAdd = (id: string) =>
    setMembersToAdd((prev) => prev.filter((m) => m.id !== id));

  const addMembersCTA = () => {
    // Không làm gì nếu chưa chọn ai
    if (membersToAdd.length === 0) return;
    onClose?.();

    queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
      const updated = (old.conversations ?? []).map((conv) => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          members: [
            ...(conv.members ?? []),
            ...membersToAdd.map((m) => ({ contact: { id: m.id, name: m.name, avatar: m.avatar } })),
          ],
        };
      });
      return { ...old, conversations: updated } as ConversationCache;
    });

    queryClient.setQueryData(["message", conversationId], (old: MessageCache) => ({
      ...old,
      messages: [
        ...(old.messages ?? []),
        {
          type: "system",
          content: `${info?.name} added new members: ${membersToAdd.map((m) => m.name).join(", ")}`,
          contactId: "system",
          createdTime: dayjs().format(),
        } as PendingMessageModel,
      ],
    }));

    addMembers(conversation?.id ?? "", membersToAdd.map((m) => m.id ?? ""));
  };

  return (
    <>
      <CustomInput
        type="text"
        placeholder="Search for name"
        inputRef={refInput}
        onChange={(e) => {
          const q = e.target.value.toLowerCase();
          setMembersToSearch(
            // Xóa hết search → reset về toàn bộ danh sách bạn bè
            q === ""
              ? data?.map((item) => item.contact) ?? []
              : membersToSearch.filter((item) => (item.name ?? "").toLowerCase().includes(q)),
          );
        }}
      />
      <div
        className={`border-(--border-color) relative flex grow gap-8 border-b-[.1rem]
          ${isPhoneScreen() ? "flex-col" : "flex-row"}`}
      >
        <FriendPickerList
          isLoading={isLoading || isRefetching}
          membersToSearch={membersToSearch}
          membersToAdd={membersToAdd}
          existingMemberIds={existingMemberIds}
          total={data?.length ?? 0}
          onToggleMember={toggleMember}
          removeMemberToAdd={removeMemberToAdd}
        />
      </div>
      <CustomButton
        className="text-2xs mr-0"
        width={4}
        gradientWidth={isPhoneScreen() ? "115%" : "110%"}
        gradientHeight={isPhoneScreen() ? "130%" : "120%"}
        rounded="3rem"
        title="Save"
        onClick={addMembersCTA}
        sm
      />
    </>
  );
};

export default AddMembersModal;
