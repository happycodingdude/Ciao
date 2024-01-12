import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

function CustomLightbox({ reference }) {
  //   const [animationDuration, setAnimationDuration] = useState(500);
  //   const [maxZoomPixelRatio, setMaxZoomPixelRatio] = useState(5);
  //   const [zoomInMultiplier, setZoomInMultiplier] = useState(2);
  //   const [doubleTapDelay, setDoubleTapDelay] = useState(300);
  //   const [doubleClickDelay, setDoubleClickDelay] = useState(300);
  //   const [doubleClickMaxStops, setDoubleClickMaxStops] = useState(2);
  //   const [keyboardMoveDistance, setKeyboardMoveDistance] = useState(50);
  //   const [wheelZoomDistanceFactor, setWheelZoomDistanceFactor] = useState(100);
  //   const [pinchZoomDistanceFactor, setPinchZoomDistanceFactor] = useState(100);
  //   const [scrollToZoom, setScrollToZoom] = useState(false);
  return reference.slides?.length <= 1 ? (
    <Lightbox
      open={reference.showLightbox}
      close={() => reference.setShowLightbox(false)}
      slides={reference.slides}
      plugins={[Zoom, Fullscreen]}
      animation={{ zoom: 500 }}
      zoom={{
        scrollToZoom: true,
        maxZoomPixelRatio: 3,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
    />
  ) : (
    <Lightbox
      open={reference.showLightbox}
      close={() => reference.setShowLightbox(false)}
      slides={reference.slides}
      plugins={[Zoom, Thumbnails, Fullscreen]}
      animation={{ zoom: 500 }}
      zoom={{
        scrollToZoom: true,
        maxZoomPixelRatio: 3,
      }}
      carousel={{ preload: 1 }}
      thumbnails={{ showToggle: true }}
      index={reference.index}
    />
  );
}

export default CustomLightbox;
