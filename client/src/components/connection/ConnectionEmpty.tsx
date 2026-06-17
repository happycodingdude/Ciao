type Props = {
  icon: string;
  title: string;
  hint?: string;
};

const ConnectionEmpty = ({ icon, title, hint }: Props) => {
  return (
    <div className="text-(--text-main-color-blur) bg-(--bg-color-extrathin) flex flex-col items-center gap-2 rounded-2xl px-6 py-12 text-center">
      <i className={`fa-solid ${icon} text-2xl opacity-60`} />
      <p className="text-(--text-main-color) text-sm font-medium">{title}</p>
      {hint && <p className="text-xs">{hint}</p>}
    </div>
  );
};

export default ConnectionEmpty;
