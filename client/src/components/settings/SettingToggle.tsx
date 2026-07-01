type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

const SettingToggle = ({
  label,
  description,
  checked,
  onChange,
  disabled,
}: Props) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-(--text-main-color) text-sm font-medium">
          {label}
        </span>
        {description && (
          <span className="text-(--text-main-color-blur) text-xs">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed
          ${checked ? "bg-light-blue-500" : "bg-(--bg-color-medium)"}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 aspect-square w-5 rounded-full bg-white shadow transition-transform
            ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
};

export default SettingToggle;
