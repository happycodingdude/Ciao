import useSettings from "../../hooks/useSettings";
import SettingsCard from "./SettingsCard";
import SettingToggle from "./SettingToggle";

const PrivacySection = () => {
  const { settings, update } = useSettings();

  return (
    <SettingsCard
      title="Privacy"
      description="Control what others can see about you. Enforced server-side."
    >
      <div className="divide-(--border-color) flex flex-col divide-y pt-1">
        <SettingToggle
          label="Show online status"
          description="Let friends see when you're online."
          checked={settings.showOnlineStatus}
          onChange={(v) => update({ showOnlineStatus: v })}
        />
        <SettingToggle
          label="Show last seen"
          description="Let friends see when you were last active."
          checked={settings.showLastSeen}
          onChange={(v) => update({ showLastSeen: v })}
        />
      </div>
    </SettingsCard>
  );
};

export default PrivacySection;
