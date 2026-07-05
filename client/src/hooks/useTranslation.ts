import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { translateMessage } from "../services/message.service";

// Trạng thái dịch theo từng tin nhắn (ephemeral, không persist). Bản dịch là lớp phủ:
// giữ nguyên bản gốc, chỉ hiển thị thêm bên dưới và cho ẩn/hiện.
export type TranslationEntry = {
  text?: string;
  sourceLang?: string;
  loading: boolean;
  visible: boolean;
};

type TranslationMap = Record<string, TranslationEntry>;

const KEY = ["translation"] as const;

export const useTranslation = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery<TranslationMap>({
    queryKey: KEY,
    queryFn: () => ({}),
    initialData: {},
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const patch = (id: string, next: Partial<TranslationEntry>) =>
    queryClient.setQueryData<TranslationMap>(KEY, (old) => ({
      ...(old ?? {}),
      [id]: { loading: false, visible: false, ...(old?.[id] ?? {}), ...next },
    }));

  // Dịch tin (hoặc bật/tắt lại nếu đã có bản dịch). Ngôn ngữ đích mặc định "vi".
  const translate = async (id: string, content: string, targetLang = "vi") => {
    const current = (queryClient.getQueryData<TranslationMap>(KEY) ?? {})[id];
    // Đã có bản dịch → chỉ toggle hiển thị, không gọi lại mạng.
    if (current?.text) {
      patch(id, { visible: !current.visible });
      return;
    }
    patch(id, { loading: true, visible: true });
    try {
      const res = await translateMessage(content, targetLang);
      patch(id, {
        text: res.translatedText,
        sourceLang: res.detectedSourceLang,
        loading: false,
        visible: true,
      });
    } catch (err) {
      console.error("translateMessage failed", err);
      patch(id, { loading: false, visible: false });
      toast.error("Không thể dịch tin nhắn");
    }
  };

  const hide = (id: string) => patch(id, { visible: false });

  return { translations: data ?? {}, translate, hide };
};
