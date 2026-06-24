// Phát âm thông báo tin nhắn mới (Phase 3 — SoundEnabled).
// Dùng 1 Audio instance tái sử dụng; reset currentTime để phát lại liên tiếp.
// Bọc try/catch + .catch vì autoplay policy có thể chặn nếu chưa có tương tác người dùng.
let audio: HTMLAudioElement | null = null;

export const playNotificationSound = () => {
  try {
    if (!audio) {
      audio = new Audio("/sounds/notify.wav");
      audio.volume = 0.5;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch {
    /* autoplay bị chặn / môi trường không hỗ trợ — bỏ qua, không crash */
  }
};
