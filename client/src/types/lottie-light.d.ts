// lottie-web chỉ ship type cho entry chính; bản light (SVG renderer, nhẹ hơn ~40%)
// dùng chung API nên mượn lại type của entry chính.
declare module "lottie-web/build/player/lottie_light" {
  import lottie from "lottie-web";
  export default lottie;
}
