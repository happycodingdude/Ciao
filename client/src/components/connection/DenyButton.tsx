import { useState } from "react";
import { removeFriend } from "../../services/friend.service";

type Props = {
  friendId?: string | null;
  // Gọi sau khi DELETE thành công để cập nhật cache (status → "new").
  onDenied?: () => void;
};

// Từ chối lời mời kết bạn nhận được (DELETE /friends/{id}). Backend cho phép receiver xoá
// lời mời chưa accept (RemoveFriend). Reversible (có thể add lại) nên không cần confirm.
const DenyButton = ({ friendId, onDenied }: Props) => {
  const [processing, setProcessing] = useState(false);

  const deny = async () => {
    if (!friendId || processing) return;
    setProcessing(true);
    try {
      await removeFriend(friendId);
      onDenied?.();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={deny}
      disabled={processing}
      className="text-(--danger-text-color) hover:bg-(--bg-color-extrathin) text-2xs shrink-0 rounded-full border border-(--border-color) px-3 py-1 font-medium transition-colors disabled:opacity-50"
    >
      {processing ? <i className="fa fa-spinner fa-spin" /> : "Deny"}
    </button>
  );
};

export default DenyButton;
