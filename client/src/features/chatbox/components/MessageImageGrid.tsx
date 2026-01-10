import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import { AttachmentModel } from "../../listchat/types";

interface MessageImageGridProps {
  attachments?: AttachmentModel[];
}

export const MessageImageGrid = ({
  attachments = [],
}: MessageImageGridProps) => {
  const total = attachments.length;

  if (total === 0) return null;

  const showMore = total > 3;
  const imagesToRender = total <= 3 ? attachments : attachments.slice(0, 3);

  const gridStyle: React.CSSProperties =
    total === 1
      ? { gridTemplateColumns: "20rem" }
      : total === 2
        ? { gridTemplateColumns: "repeat(2, 14rem)" }
        : {
            gridTemplateColumns: "repeat(3, 10rem)",
            gridTemplateRows: "repeat(2, 10rem)",
          };

  return (
    <div className="grid gap-2 w-fit self-center" style={gridStyle}>
      {imagesToRender.map((item, index) => {
        const isMainImage = index === 0 && total >= 3;
        const isLastVisibleImage = showMore && index === 2;

        return (
          <div
            key={index}
            className={`relative aspect-square w-full ${
              isMainImage ? "col-span-2 row-span-2" : ""
            }`}
          >
            <ImageWithLightBoxAndNoLazy
              src={item.mediaUrl}
              title={item.mediaName?.split(".")[0]}
              className="aspect-square w-full cursor-pointer"
              slides={attachments.map((img) => ({
                src: img.type === "image" ? img.mediaUrl : "",
              }))}
              index={index}
              pending={item.pending}
              local={item.local}
            />

            {isLastVisibleImage && (
              <div className="mosaic-overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-2xl text-white">
                <p className="text-sm font-semibold ">+{total - 3}</p>
                <p>more photos</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
