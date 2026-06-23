import useSettings from "../../hooks/useSettings";
import {
  registerConnection,
  requestPermission,
} from "../../services/notification.service";
import SettingsCard from "./SettingsCard";
import SettingToggle from "./SettingToggle";

const NotificationsSection = () => {
  const { settings, update } = useSettings();

  // Bật push → xin quyền trình duyệt + đăng ký lại FCM token cho thiết bị này.
  const onPushChange = (next: boolean) => {
    update({ pushEnabled: next });
    if (next) {
      requestPermission({
        registerConnection: async (token: string) => {
          await registerConnection(token);
        },
      });
    }
  };

  const pushOff = !settings.pushEnabled;

  return (
    <SettingsCard
      title="Notifications"
      description="Control what you get notified about."
    >
      <div className="divide-(--border-color) flex flex-col divide-y pt-1">
        <SettingToggle
          label="Push notifications"
          description="Receive push notifications on this device."
          checked={settings.pushEnabled}
          onChange={onPushChange}
        />
        <SettingToggle
          label="Sound"
          description="Play a sound for new notifications."
          checked={settings.soundEnabled}
          onChange={(v) => update({ soundEnabled: v })}
        />
        <SettingToggle
          label="Messages"
          description="New messages in your conversations."
          checked={settings.notifyOnMessage}
          disabled={pushOff}
          onChange={(v) => update({ notifyOnMessage: v })}
        />
        <SettingToggle
          label="Friend requests"
          description="When someone sends or accepts a request."
          checked={settings.notifyOnFriendRequest}
          disabled={pushOff}
          onChange={(v) => update({ notifyOnFriendRequest: v })}
        />
        <SettingToggle
          label="Reactions"
          description="When someone reacts to your message."
          checked={settings.notifyOnReaction}
          disabled={pushOff}
          onChange={(v) => update({ notifyOnReaction: v })}
        />
      </div>
    </SettingsCard>
  );
};

export default NotificationsSection;
