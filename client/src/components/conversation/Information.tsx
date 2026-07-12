import {
  CloseOutlined,
  EditOutlined,
  LogoutOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { leaveConversation } from "../../services/conv.service";
import { updateConversationInCache } from "../../utils/conversationCache";
import { useSignal } from "../../context/SignalContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/information.css";
import { UserProfile } from "../../types/base.types";
import BackgroundPortal from "../common/BackgroundPortal";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import AddMembers, { AddMembersProps } from "./AddMembers";
import InformationAppearance from "./InformationAppearance";
import InformationAttachments from "./InformationAttachments";
import InformationInvite from "./InformationInvite";
import InformationJoinRequests from "./InformationJoinRequests";
import InformationMembers from "./InformationMembers";
import UpdateConversation from "./UpdateConversation";

const Information = () => {
  const { startLocalStream } = useSignal();
  const { data: conversations } = useConversation();
  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  // Information thuần lo UI info — toàn bộ lifecycle của Search (reset khi đổi conversation,
  // phím tắt Ctrl/Cmd+F, render overlay) đã được tách sang ChatboxContainer + InformationSearch.
  // Nút X = đóng panel đang active (state mutually exclusive nên 1 set null là đủ).
  const { showInformation, setActiveDetail } = useChatDetailToggles();
  const { data: info } = useInfo();

  const refInformation = useRef<HTMLDivElement>(null);
  const refAddMembers = useRef<AddMembersProps>(null);
  const [openUpdateTitle, setOpenUpdateTitle] = useState(false);

  // Phase 5 — Đợt 2b: rời nhóm (confirm trước khi rời).
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openLeave, setOpenLeave] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const otherMember = (conversation?.members ?? []).find(
    (m) => m.contact?.id !== info?.id,
  );
  // Phase 5 — Đợt 2: quản trị nhóm mới thấy section Link mời + Join requests.
  const selfIsModerator = !!(conversation?.members ?? []).find(
    (m) => m.contact?.id === info?.id,
  )?.isModerator;

  // Đợt 2b: quản trị DUY NHẤT không được rời khi nhóm còn thành viên active khác
  // (chưa có UI trao quyền — BE cũng enforce, đây là pre-check để modal giải thích rõ).
  const activeOthers = (conversation?.members ?? []).filter(
    (m) => m.contact?.id !== info?.id && !m.isDeleted,
  );
  const leaveBlocked =
    selfIsModerator &&
    activeOthers.length > 0 &&
    !activeOthers.some((m) => m.isModerator);

  const handleLeave = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await leaveConversation(conversationId);
      // Đánh dấu member của MÌNH đã rời → list (filter theo member active) tự ẩn hội thoại.
      // Thiết bị khác + member còn lại đồng bộ qua event realtime MemberLeft.
      queryClient.setQueryData(["conversation"], (old: any) =>
        old
          ? updateConversationInCache(old, conversationId, (c) => ({
              ...c,
              members: (c.members ?? []).map((m) =>
                m.contact?.id !== info?.id ? m : { ...m, isDeleted: true },
              ),
            }))
          : old,
      );
      toast.success("You left the group");
      setOpenLeave(false);
      navigate({ to: "/conversations" });
    } catch {
      toast.error("Failed to leave the group");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 pb-4 ${showInformation ? "z-10" : "z-0"} bg-(--bg-color) flex h-full w-full flex-col`}
    >
      <div className="border-b-(--border-color) panel-header-h bg-(--bg-color) flex items-center justify-between border-b-[.1rem] px-4">
        <p className="text-base font-medium">Chat information</p>
        <div className="flex gap-4">
          {conversation?.isGroup && (
            <div
              className="fa fa-pen-to-square base-icon-sm hover:text-light-blue-500"
              onClick={() => setOpenUpdateTitle(true)}
            />
          )}
          <BackgroundPortal
            show={openUpdateTitle}
            className="modal-size-lg"
            title="Update group"
            description="Change the group name and avatar"
            icon={<EditOutlined />}
            onClose={() => setOpenUpdateTitle(false)}
          >
            {conversation && (
              <UpdateConversation
                selected={conversation}
                onClose={() => setOpenUpdateTitle(false)}
              />
            )}
          </BackgroundPortal>
          <CloseOutlined
            className="base-icon-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // State mutually exclusive — 1 lần set null là đóng panel duy nhất đang mở.
              setActiveDetail(null);
            }}
          />
        </div>
      </div>
      <div className="*:border-b-(--border-color) hide-scrollbar flex grow flex-col overflow-y-auto *:border-b-[.1rem] *:px-4 *:py-2">
        <div className="flex flex-col items-center gap-4">
          <ImageWithLightBoxAndNoLazy
            src={
              conversation?.isGroup
                ? conversation.avatar
                : otherMember?.contact?.avatar
            }
            slides={[
              {
                src: conversation?.isGroup
                  ? (conversation.avatar ?? "")
                  : (otherMember?.contact?.avatar ?? ""),
              },
            ]}
            className="relative aspect-square w-20 cursor-pointer"
            circle
          />
          <div className="laptop:text-base flex w-[70%] grow flex-col items-center justify-center gap-2">
            <CustomLabel
              className="text-center font-medium"
              title={
                conversation?.isGroup
                  ? conversation.title
                  : otherMember?.contact?.name
              }
              tooltip
            />
          </div>
          <div className="conversation-action-container">
            {conversation?.isGroup && (
              <div
                className="conversation-action"
                onClick={() => refAddMembers.current?.open()}
              >
                <AddMembers ref={refAddMembers} />
              </div>
            )}
            <div
              className="conversation-action"
              onClick={() => {
                if (otherMember?.contact) {
                  startLocalStream(otherMember.contact as UserProfile);
                }
              }}
            >
              <VideoCameraOutlined className="base-icon-sm transition-all duration-200" />
            </div>
            {conversation?.isGroup && (
              <div
                className="conversation-action fa fa-right-from-bracket"
                title="Leave group"
                onClick={() => setOpenLeave(true)}
              />
            )}
            <BackgroundPortal
              show={openLeave}
              className="modal-size-lg"
              title="Leave group"
              description={conversation?.title}
              icon={<LogoutOutlined />}
              onClose={() => setOpenLeave(false)}
            >
              <div className="flex flex-col gap-6 p-6">
                {leaveBlocked ? (
                  <>
                    <p className="text-sm">
                      You are the only admin of this group. The group must have
                      another admin before you can leave. (Admin transfer is
                      coming in a later update.)
                    </p>
                    <div className="flex justify-end">
                      <button
                        className="bg-(--bg-color-extrathin) hover:text-light-blue-500 cursor-pointer rounded-lg px-6 py-2 text-sm font-medium"
                        onClick={() => setOpenLeave(false)}
                      >
                        Got it
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      You will stop receiving messages from this group and it
                      will disappear from your chat list. To come back, you must
                      be added again or join via an invite link.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        className="bg-(--bg-color-extrathin) hover:text-light-blue-500 cursor-pointer rounded-lg px-6 py-2 text-sm font-medium"
                        onClick={() => setOpenLeave(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="cursor-pointer rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
                        disabled={leaving}
                        onClick={handleLeave}
                      >
                        Leave group
                      </button>
                    </div>
                  </>
                )}
              </div>
            </BackgroundPortal>
          </div>
        </div>

        {conversation?.isGroup && (
          <InformationMembers
            conversation={conversation}
            selfId={info?.id}
            panelRef={refInformation}
          />
        )}

        {/* Phase 5 — Đợt 2: hàng chờ duyệt + link mời (nhóm, chỉ quản trị — BE cũng enforce) */}
        {conversation?.isGroup && selfIsModerator && (
          <InformationJoinRequests conversationId={conversationId} />
        )}
        {conversation?.isGroup && selfIsModerator && (
          <InformationInvite conversationId={conversationId} />
        )}

        <InformationAppearance conversationId={conversationId} />

        <InformationAttachments conversationId={conversationId} />
      </div>
    </div>
  );
};

export default Information;
