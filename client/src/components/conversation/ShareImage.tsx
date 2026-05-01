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
    <div
      className="absolute left-0 top-0 z-10 h-full w-full cursor-pointer rounded-2xl bg-black/20 opacity-0 hover:opacity-100 peer-hover:opacity-100"
      onClick={showImage}
    >
      <div
        className="absolute right-2 top-1 flex aspect-square w-5 items-center justify-center rounded-sm bg-white"
        onClick={(e) => {
          e.stopPropagation();
          setShow(true);
        }}
      >
        <i className="fa fa-share" />
      </div>
      <BackgroundPortal
        show={show}
        className="laptop:w-100 phone:w-80 desktop:w-[35%]"
        title="Forward message"
        onClose={() => setShow(false)}
      >
        <div className="phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col p-5">
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
    </div>
  );
};

export default ShareImage;
