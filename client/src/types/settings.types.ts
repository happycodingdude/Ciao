export type SettingsSectionKey =
  | "profile"
  | "appearance"
  | "notifications"
  | "privacy"
  | "account";

export type SettingsSectionDef = {
  key: SettingsSectionKey;
  label: string;
  icon: string;
};

export const SETTINGS_SECTIONS: SettingsSectionDef[] = [
  { key: "profile", label: "Profile", icon: "fa-user" },
  { key: "appearance", label: "Appearance", icon: "fa-palette" },
  { key: "notifications", label: "Notifications", icon: "fa-bell" },
  { key: "privacy", label: "Privacy", icon: "fa-lock" },
  { key: "account", label: "Account", icon: "fa-shield-halved" },
];
