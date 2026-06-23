import useTheme, { Theme } from "../../hooks/useTheme";
import SettingsCard from "./SettingsCard";

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "fa-sun" },
  { value: "dark", label: "Dark", icon: "fa-moon" },
];

const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsCard
      title="Appearance"
      description="Choose how Ciao looks to you."
    >
      <div className="grid grid-cols-2 gap-3 pt-2">
        {OPTIONS.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-5 transition-colors
                ${
                  isActive
                    ? "border-light-blue-500 bg-light-blue-500/10"
                    : "border-(--border-color) hover:bg-(--bg-color-extrathin)"
                }`}
            >
              <i
                className={`fa-solid ${opt.icon} text-xl ${
                  isActive
                    ? "text-light-blue-500"
                    : "text-(--text-main-color-blur)"
                }`}
              />
              <span className="text-(--text-main-color) text-sm font-medium">
                {opt.label}
              </span>
              {isActive && (
                <i className="fa-solid fa-circle-check text-light-blue-500 text-xs" />
              )}
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
};

export default AppearanceSection;
