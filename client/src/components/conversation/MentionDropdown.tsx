import { MutableRefObject } from "react";
import { MentionModel } from "../../types/message.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type Props = {
  mentions: MentionModel[];
  selectedIndex: number;
  show: boolean;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  itemRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
  onChoose: (userId: string) => void;
};

const MentionDropdown = ({
  mentions,
  selectedIndex,
  show,
  containerRef,
  itemRefs,
  onChoose,
}: Props) => (
  <div
    ref={containerRef}
    data-show={show}
    className="z-2 laptop:max-h-60 laptop:w-60 absolute bottom-24 left-0
    flex flex-col gap-2 overflow-y-scroll scroll-smooth rounded-[.7rem] bg-white p-2
    shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-200
    data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto
    data-[show=false]:opacity-0 data-[show=true]:opacity-100"
  >
    {mentions.length === 0 ? (
      <p className="text-center text-sm text-gray-500">No members found</p>
    ) : (
      mentions.map((item, index) => (
        <div
          key={item.userId}
          ref={(el) => (itemRefs.current[index] = el)}
          className={`mention-user flex cursor-pointer gap-4 rounded-[.7rem] px-3 py-1 ${index === selectedIndex ? "active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onChoose(item.userId);
          }}
        >
          <ImageWithLightBoxAndNoLazy
            src={item.avatar ?? undefined}
            slides={[{ src: item.avatar ?? "" }]}
            className="aspect-square h-8 cursor-pointer"
            circle
          />
          <p>{item.name}</p>
        </div>
      ))
    )}
  </div>
);

export default MentionDropdown;
