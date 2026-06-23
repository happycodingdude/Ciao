import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { changePassword, signout } from "../../services/auth.service";
import SettingsCard from "./SettingsCard";

const inputCls =
  "border-(--border-color) bg-(--bg-color) text-(--text-main-color) rounded-lg border px-3 py-2 text-sm outline-none focus:border-(--main-color)";

// Ô mật khẩu kèm nút con mắt toggle hiển thị/ẩn (state riêng từng ô).
const PasswordField = ({
  label,
  value,
  autoComplete,
  onChange,
}: {
  label: string;
  value: string;
  autoComplete: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-(--text-main-color) text-xs font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`${inputCls} w-full pr-10`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-(--text-main-color-blur) hover:text-(--text-main-color) absolute right-3 top-1/2 -translate-y-1/2 text-sm"
        >
          <i className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`} />
        </button>
      </div>
    </div>
  );
};

const AccountSection = () => {
  const queryClient = useQueryClient();

  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");

  const redirectToAuth = () => {
    window.location.href = "/auth";
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => changePassword({ oldPassword, newPassword }),
    onSuccess: () => {
      toast.success("🔐 Password changed. Please sign in again.");
      // BE đã invalidate refresh token → buộc đăng nhập lại.
      signout(queryClient).finally(redirectToAuth);
    },
    onError: (err: any) => {
      const msg =
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Could not change password";
      toast.error(msg);
    },
  });

  const submit = () => {
    if (!oldPassword || !newPassword) return;
    if (newPassword === oldPassword) {
      toast.error("New password must be different from the current password");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    mutate();
  };

  const logout = () => {
    signout(queryClient).finally(redirectToAuth);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard
        title="Change password"
        description="You'll be signed out on all devices after changing it."
      >
        <div className="flex flex-col gap-4 pt-2">
          <PasswordField
            label="Current password"
            value={oldPassword}
            autoComplete="current-password"
            onChange={(e) => setOld(e.target.value)}
          />
          <PasswordField
            label="New password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(e) => setNew(e.target.value)}
          />
          <PasswordField
            label="Confirm new password"
            value={confirm}
            autoComplete="new-password"
            onChange={(e) => setConfirm(e.target.value)}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!oldPassword || !newPassword || !confirm || isPending}
              className="bg-light-blue-500 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
              <i
                className={`fa-solid ${
                  isPending ? "fa-spinner animate-spin" : "fa-key"
                } text-xs`}
              />
              Update password
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Session"
        description="Sign out of your account on this device."
      >
        <div className="flex justify-start pt-2">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-red-400 px-5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket text-xs" />
            Sign out
          </button>
        </div>
      </SettingsCard>
    </div>
  );
};

export default AccountSection;
