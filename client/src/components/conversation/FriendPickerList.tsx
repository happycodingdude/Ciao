import { CheckCircleOutlined } from "@ant-design/icons";
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
      <div className="list-friend-container hide-scrollbar flex grow flex-col gap-2 overflow-y-scroll scroll-smooth">
        {membersToSearch.map((item) => {
          const isExisting = existingMemberIds.includes(item.id ?? "");
          const isSelected = membersToAdd.some((m) => m.id === item.id);
          return (
            <div
              key={item.id}
              className={`information-members flex w-full items-center gap-2 rounded-lg p-[.7rem]
                ${isExisting
                  // Thành viên đã trong group → không cho click (hiển thị "Joined")
                  ? "pointer-events-none"
                  : "hover:bg-(--bg-color-extrathin) cursor-pointer"}`}
              onClick={() => !isExisting && onToggleMember(item)}
            >
              <CheckCircleOutlined
                // Icon xanh khi đã là thành viên hoặc đang được chọn thêm
                className={`base-icon ${isExisting || isSelected ? "text-light-blue-500!" : ""}`}
              />
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
                {isExisting && <p className="text-(--text-main-color-blur)">Joined</p>}
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
