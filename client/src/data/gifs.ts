// Nguồn GIF sẵn (free hotlink từ Giphy) — người dùng CHỌN từ danh sách, không tự upload.
// URL đã được kiểm tra trả 200. Có thể inject/mở rộng thêm link GIF free tại đây.

export type Gif = { url: string; keywords: string[] };

const g = (id: string, keywords: string[]): Gif => ({
  url: `https://media.giphy.com/media/${id}/giphy.gif`,
  keywords,
});

export const GIFS: Gif[] = [
  g("l0MYt5jPR6QX5pnqM", ["hello", "xin chào"]),
  g("xUPGcguWZHRC2HyBRS", ["hi", "chào"]),
  g("3oEjI6SIIHBdRxXI40", ["thumbs up", "ok", "tốt"]),
  g("26FLdmIp6wJr91JAI", ["ok", "đồng ý"]),
  g("26BRuo6sLetdllPAQ", ["love", "yêu", "thích"]),
  g("3oz8xLd9DJq2l2VFtu", ["heart", "tim"]),
  g("xT0xeJpnrWC4XWblEk", ["laugh", "cười"]),
  g("10JhviFuU2gWD6", ["lol", "haha"]),
  g("26ufdipQqU2lhNA4g", ["cry", "khóc"]),
  g("d2lcHJTG5Tscg", ["sad", "buồn"]),
  g("26u4b45b8KlgAB7iM", ["clap", "vỗ tay"]),
  g("g9582DNuQppxC", ["party", "tiệc", "chúc mừng"]),
  g("3o7abKhOpu0NwenH3O", ["wow", "ngạc nhiên"]),
  g("3o6Zt6ML6BklcajjsA", ["bye", "tạm biệt"]),
  g("l0HlBO7eyXzSZkJri", ["wink", "nháy mắt"]),
  g("3oEjHV0z8S7WM4MwnK", ["cool", "ngầu"]),
];
