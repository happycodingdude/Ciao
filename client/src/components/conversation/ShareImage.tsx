import { ShareAltOutlined } from "@ant-design/icons";
import { Suspense, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/information.css";
import { AttachmentModel } from "../../types/message.types";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
import ForwardMessageModal from "../message/ForwardMessageModal";

const ShareImage = ({
  media,
  showImage,
}: {
  media: AttachmentModel;
  showImage: () => void;
}) => {
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();

  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const [show, setShow] = useState<boolean>(false);

  if (!media) return null;

  return (
    <>
      <div
        className="absolute left-0 top-0 z-10 h-full w-full cursor-pointer rounded-2xl bg-black/20 opacity-0 hover:opacity-100 peer-hover:opacity-100"
        onClick={showImage}
      >
        <div
          className="bg-(--bg-color) absolute right-2 top-1 flex aspect-square w-5 items-center justify-center rounded-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShow(true);
          }}
        >
          <i className="fa fa-share" />
        </div>
      </div>
      <BackgroundPortal
        show={show}
        className="modal-size-md"
        title="Share image"
        description="Send this image to your friends"
        icon={<ShareAltOutlined />}
        onClose={() => setShow(false)}
      >
        <div className="text-(--text-main-color) modal-content-h flex flex-col gap-5 px-6 pb-6 pt-2">
          <Suspense fallback={<ModalLoading />}>
            <ForwardMessageModal
              message={{
                type: "media",
                attachments: [media],
              }}
              forward={false}
              directContact={
                !conversation?.isGroup
                  ? (conversation?.members ?? []).find(
                      (item) => item.contact?.id !== info?.id,
                    )?.contact?.id
                  : undefined
              }
            />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default ShareImage;
