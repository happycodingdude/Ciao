import {
  SETTINGS_SECTIONS,
  SettingsSectionKey,
} from "../../types/settings.types";

type Props = {
  active: SettingsSectionKey;
  onChange: (key: SettingsSectionKey) => void;
};

const SettingsNav = ({ active, onChange }: Props) => {
  return (
    <nav
      className="hide-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-1
        laptop:w-56 laptop:flex-col laptop:overflow-visible laptop:pb-0"
    >
      {SETTINGS_SECTIONS.map((s) => {
        const isActive = s.key === active;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors laptop:w-full
              ${
                isActive
                  ? "bg-light-blue-500 font-medium text-white"
                  : "text-(--text-main-color) hover:bg-(--bg-color-extrathin)"
              }`}
          >
            <i className={`fa-solid ${s.icon} w-4 text-center text-xs`} />
            {s.label}
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsNav;
