import { useEffect, useState } from "react";

interface LazyEmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
  onClickOutside: (e: any) => void;
}

// ✅ Optimized: Use native emoji data instead of apple.json to reduce bundle (-400KB)
const LazyEmojiPicker = ({
  onEmojiSelect,
  onClickOutside,
}: LazyEmojiPickerProps) => {
  const [Picker, setPicker] = useState<any>(null);

  useEffect(() => {
    // Only import Picker, use native emoji (no additional data needed)
    import("@emoji-mart/react").then((pickerModule) => {
      setPicker(() => pickerModule.default);
    });
  }, []);

  if (!Picker) {
    return (
      <div className="flex h-176 w-84 animate-pulse items-center justify-center rounded-lg bg-gray-100">
        <span className="text-gray-500">Loading emoji...</span>
      </div>
    );
  }

  return (
    <Picker
      // ✅ Use 'native' instead of 'apple' to avoid loading 400KB+ emoji data
      set="native"
      theme="light"
      onEmojiSelect={onEmojiSelect}
      onClickOutside={onClickOutside}
      previewPosition="none"
      skinTonePosition="search"
    />
  );
};

export default LazyEmojiPicker;
