import { useState } from "react";
import AccountSection from "../components/settings/AccountSection";
import NotificationsSection from "../components/settings/NotificationsSection";
import PrivacySection from "../components/settings/PrivacySection";
import ProfileSection from "../components/settings/ProfileSection";
import SettingsNav from "../components/settings/SettingsNav";
import { SettingsSectionKey } from "../types/settings.types";

const SECTION_COMPONENTS: Record<SettingsSectionKey, () => JSX.Element> = {
  profile: ProfileSection,
  notifications: NotificationsSection,
  privacy: PrivacySection,
  account: AccountSection,
};

const Setting = () => {
  const [section, setSection] = useState<SettingsSectionKey>("profile");
  const ActiveSection = SECTION_COMPONENTS[section];

  // Chỉ Account (form đổi mật khẩu + session = 2 card) mới cho cuộn. Các tab còn lại là form
  // ngắn → canh giữa theo chiều dọc cho cân đối, không sinh scrollbar trong 1 màn hình.
  const scrollable = section === "account";

  return (
    <section className="bg-(--bg-color) relative h-screen w-full overflow-hidden">
      {/* #portal (global CSS có height:100%) phải nằm NGOÀI flex container. */}
      <div className="flex h-full flex-col">
        {/* Header cố định (shrink-0). */}
        <div className="mx-auto flex w-full max-w-4xl shrink-0 flex-col gap-0.5 px-6 pt-5">
          <h1 className="text-(--text-main-color) flex items-center gap-3 text-2xl font-semibold">
            <i className="fa-solid fa-gear text-light-blue-500" />
            Settings
          </h1>
          <p className="text-(--text-main-color-blur) text-sm">
            Manage your profile, appearance and preferences.
          </p>
        </div>

        {/* Vùng nav + content — flex-1 + min-h-0. */}
        <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-4 px-6 pb-4 pt-3 laptop:flex-row laptop:gap-6">
          <SettingsNav active={section} onChange={setSection} />

          <div
            className={`hide-scrollbar min-h-0 flex-1 pr-1 ${scrollable
                ? "overflow-y-auto"
                : "flex flex-col overflow-hidden"
              }`}
          >
            <ActiveSection />
          </div>
        </div>
      </div>

      <div id="portal"></div>
    </section>
  );
};

export default Setting;
