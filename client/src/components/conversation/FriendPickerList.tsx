import { CheckOutlined } from "@ant-design/icons";
import { ContactModel } from "../../types/friend.types";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ListFriendLoading from "../common/ListFriendLoading";
import MemberToAdd_LargeScreen from "./MemberToAdd_LargeScreen";
import MemberToAdd_Phone from "./MemberToAdd_Phone";
import { isPhoneScreen } from "../../utils/getScreenSize";

type Props = {
  isLoading: boolean;
  membersToSearch: ContactModel[];
  membersToAdd: ContactModel[];
  existingMemberIds?: string[];
  total: number;
  onToggleMember: (item: ContactModel) => void;
  removeMemberToAdd: (id: string) => void;
};

const FriendPickerList = ({
  isLoading,
  membersToSearch,
  membersToAdd,
  existingMemberIds = [],
  total,
  onToggleMember,
  removeMemberToAdd,
}: Props) => {
  // Hiện skeleton khi đang load dữ liệu bạn bè lần đầu
  if (isLoading) return <ListFriendLoading />;

  return (
    <>
      <div className="list-friend-container hide-scrollbar border-(--border-color) bg-(--search-bg-color) flex grow flex-col overflow-y-auto rounded-xl border scroll-smooth">
        {membersToSearch.map((item) => {
          const isExisting = existingMemberIds.includes(item.id ?? "");
          const isSelected = membersToAdd.some((m) => m.id === item.id);
          const checked = isExisting || isSelected;
          return (
            <div
              key={item.id}
              className={`information-members border-(--border-color) flex w-full items-center gap-3 border-b p-3 last:border-b-0
                ${isExisting
                  // Thành viên đã trong group → không cho click (hiển thị "Joined")
                  ? "pointer-events-none"
                  : "hover:bg-(--bg-color-extrathin) cursor-pointer"}`}
              onClick={() => !isExisting && onToggleMember(item)}
            >
              {/* Checkbox ô vuông bo góc: tích xanh khi đã là thành viên hoặc đang được chọn */}
              <span
                className={`flex aspect-square w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all
                  ${checked
                    ? "bg-light-blue-500 border-light-blue-500 text-white"
                    : "border-(--text-main-color-blur)"}`}
              >
                {checked && <CheckOutlined className="text-[0.65rem]" />}
              </span>
              <ImageWithLightBoxAndNoLazy
                src={item.avatar ?? undefined}
                className="aspect-square w-10 cursor-pointer"
                circle
                slides={[{ src: item.avatar ?? "" }]}
                onClick={() => {}}
                local
              />
              <div>
                <CustomLabel title={item.name} />
                {/* Label "Joined" chỉ hiển thị cho thành viên đã có trong group */}
                {isExisting && <p className="text-(--text-main-color-blur) text-sm">Joined</p>}
              </div>
            </div>
          );
        })}
      </div>
      {/* Layout khác nhau theo kích thước màn hình */}
      {isPhoneScreen() ? (
        <MemberToAdd_Phone
          membersToAdd={membersToAdd}
          total={total}
          removeMemberToAdd={removeMemberToAdd}
        />
      ) : (
        <MemberToAdd_LargeScreen
          membersToAdd={membersToAdd}
          total={total}
          removeMemberToAdd={removeMemberToAdd}
        />
      )}
    </>
  );
};

export default FriendPickerList;
