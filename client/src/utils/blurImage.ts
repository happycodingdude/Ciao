const blurImage = (containerClass: string) => {
  let observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target instanceof HTMLElement) {
          const targetElement = entry.target as HTMLElement;

          // Apply background image from data-src
          const dataSrc = targetElement.dataset.src;
          if (dataSrc) {
            targetElement.style.backgroundImage = `url('${dataSrc}')`;
          }

          // Find the previous sibling with the 'loading' class
          const sibling =
            targetElement.previousElementSibling as HTMLElement | null;
          if (sibling?.classList.contains("loading")) {
            sibling.style.opacity = "0";
          }

          observer.unobserve(targetElement);
        }
      });
    },
    { threshold: 0.5 },
  );

  const container = document.querySelector(containerClass);
  if (!container) return;

  const images = container.querySelectorAll<HTMLElement>(".lazy-image");
  images.forEach((img) => observer.observe(img));
};

export default blurImage;
// export const blurImageOLD1 = (containerClass) => {
//   const container = document.querySelector(containerClass);
//   const blurredDivs = container.querySelectorAll(".blurred-div");
//   blurredDivs.forEach(async (div) => {
//     // await delay();
//     // if (div.classList.contains("loaded")) return;
//     const img = div.querySelector("img");
//     if (img.complete) {
//       loaded();
//     } else {
//       img.addEventListener("load", loaded);
//     }
//     function loaded() {
//       div.classList.add("loaded");
//     }

//     function delay() {
//       return new Promise((resolve) => setTimeout(resolve, 500));
//     }
//   });
// };

// export const blurImageOld = (containerClass) => {
//   // setTimeout(() => {

//   // Duyệt tất cả tấm ảnh cần lazy-load
//   const container = document.querySelector(containerClass);
//   const lazyBackgrounds = container.querySelectorAll(".lazy-image");

//   // Chờ các tấm ảnh này xuất hiện trên màn hình
//   const lazyImageObserver = new IntersectionObserver((entries, observer) => {
//     entries.forEach((entry) => {
//       // Tấm ảnh này đã xuất hiện trên màn hình
//       if (entry.isIntersecting) {
//         const lazyImage = entry.target;

//         // Nếu ảnh đã hiển thị rồi thì bỏ qua
//         // if (!lazyImage.classList.contains("blurred")) {
//         //   observer.unobserve(lazyImage);
//         //   return;
//         // }

//         const src = lazyImage.dataset.src;

//         lazyImage.tagName.toLowerCase() === "img"
//           ? // <img>: copy data-src sang src
//             (lazyImage.src = src)
//           : // <div>: copy data-src sang background-image
//             (lazyImage.style.backgroundImage = "url('" + src + "')");

//         // Copy xong rồi thì bỏ class 'blurred' đi để hiển thị
//         lazyImage.classList.remove("blurred");

//         // Job done, không cần observe nó nữa
//         observer.unobserve(lazyImage);
//       }
//     });
//   });

//   // Observe từng tấm ảnh và chờ nó xuất hiện trên màn hình
//   lazyBackgrounds.forEach((lazyImage) => {
//     lazyImageObserver.observe(lazyImage);
//   });

//   // }, 500);
