import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import moment from "moment";
import CustomLabel from "../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../components/ImageWithLightBoxAndNoLazy";
import LocalLoading from "../components/LocalLoading";
import ListchatFilterProvider from "../context/ListchatFilterContext";
import useInfo from "../features/authentication/hooks/useInfo";
import AddFriend from "../features/friend/components/AddFriend";
import CreateGroupChat from "../features/groupchat/components/CreateGroupChat";
import ListChat from "../features/listchat/components/ListChat";
import ListChatHeader from "../features/listchat/components/ListChatHeader";
import ListChatHeader_Mobile from "../features/listchat/components/ListChatHeader_Mobile";
import useConversation from "../features/listchat/hooks/useConversation";
import useListchatFilter from "../features/listchat/hooks/useListchatFilter";
import useLoading from "../hooks/useLoading";
import "../listchat.css";
import { isPhoneScreen } from "../utils/getScreenSize";

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    ss: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1Y",
    yy: "%dY",
  },
});

const ListChatContainer = () => {
  const { data: conversations, isLoading, isRefetching } = useConversation(1);
  const { data: info } = useInfo();

  // const [filter, setFilter] = useState<"all" | "direct" | "group">("all");
  const { filter, setFilter } = useListchatFilter();

  const queryClient = useQueryClient();
  const { setLoading } = useLoading();
  // const clickConversation = async (id: string) => {
  //   if (conversations.selected?.id === id) return;

  //   flushSync(() => {
  //     setLoading(true);
  //   });

  //   queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
  //     const data: ConversationCache = {
  //       ...oldData,
  //       selected: oldData.filterConversations.find((item) => item.id === id),
  //       reload: true,
  //       quickChat: false,
  //       message: null,
  //     };
  //     return data;
  //   });

  //   const [messages, attachments] = await Promise.all([
  //     getMessages(id, 1),
  //     getAttachments(id),
  //   ]);

  //   queryClient.setQueryData(["message"], messages);
  //   queryClient.setQueryData(["attachment"], attachments);

  //   setLoading(false);
  // };

  return (
    <ListchatFilterProvider>
      {isPhoneScreen() ? (
        <div
          className={`absolute flex h-full w-full flex-col bg-[var(--bg-color)]
            ${conversations?.selected ? "z-0" : "z-[10]"}`}
        >
          <div className="flex h-[5rem] shrink-0 items-center justify-between px-[1rem]">
            <p className="text-xl font-bold">Messages</p>
            <div className="flex h-full items-center gap-[2rem]">
              <AddFriend />
              <CreateGroupChat />
              <ImageWithLightBoxAndNoLazy
                src={info.avatar}
                className="aspect-square w-[3rem] cursor-pointer"
                slides={[
                  {
                    src: info.avatar,
                  },
                ]}
                circle
              />
            </div>
          </div>

          <ListChatHeader_Mobile />
          <ListChat />
        </div>
      ) : (
        <div
          id="chat-list-v2"
          // className="version-2 flex h-screen w-[30rem] shrink-0 flex-col rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50"
          className="flex h-screen w-[30rem] shrink-0 flex-col gap-[2rem] bg-pastel-pink"
        >
          <div className="flex flex-col gap-[1.5rem] px-[2rem] pt-[1rem]">
            <div className="relative">
              {/* <input
                type="text"
                placeholder="Find and chat"
                className="w-full rounded-3xl bg-white px-4 py-3 pr-20 shadow-sm focus:shadow-lg focus:outline-none"
              /> */}
              {/* <div className="absolute right-3 top-1/2 flex -translate-y-1/2 transform space-x-2">
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200">
                  <i className="fa-solid fa-filter text-xs text-purple-600"></i>
                </div>
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200">
                  <i className="fa-solid fa-gear text-xs text-purple-600"></i>
                </div>
              </div> */}
              <ListChatHeader />
            </div>

            <div className="flex gap-[1rem]">
              <div
                className={`${filter === "all" ? "selected" : ""}  cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
                onClick={() => setFilter("all")}
              >
                All
              </div>
              <div
                className={`${filter === "direct" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
                onClick={() => setFilter("direct")}
              >
                Direct
              </div>
              <div
                className={`${filter === "group" ? "selected" : ""} cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-600 
                shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] transition-colors duration-300 ease-in-out hover:shadow-md`}
                onClick={() => setFilter("group")}
              >
                Group
              </div>
            </div>
          </div>

          <div
            className={`relative flex grow flex-col gap-[2rem] ${isLoading || isRefetching ? "" : "px-[2rem]"} hide-scrollbar overflow-y-scroll scroll-smooth`}
          >
            {/* <LocalLoading /> */}
            {isLoading || isRefetching ? <LocalLoading /> : ""}
            {conversations?.filterConversations
              .filter((conv) =>
                conv.members.some(
                  (mem) => mem.contact.id === info.id && !mem.isDeleted,
                ),
              )
              .map((item) => (
                <Link
                  to={`/conversations/${item.id}`}
                  // className="block h-full w-full"
                >
                  <div
                    key={item.id}
                    // onClick={() => {
                    //   clickConversation(item.id);
                    // }}
                    className={`chat-item cursor-pointer rounded-2xl bg-white p-4 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]
                    ${item.id === conversations.selected?.id ? "active" : ""}`}
                  >
                    <div className="flex items-center laptop:h-[4rem]">
                      <div className="relative">
                        {/* MARK: AVATAR */}
                        <ImageWithLightBoxAndNoLazy
                          src={
                            item.isGroup
                              ? item.avatar
                              : item.members.find(
                                  (item) => item.contact.id !== info.id,
                                )?.contact.avatar
                          }
                          className={`loaded pointer-events-none aspect-square w-[4rem] animate-morph`}
                          circle
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 aspect-square w-[1.5rem] rounded-full border-2 border-white 
                        ${item.members.some((mem) => mem.contact.isOnline && mem.contact.id !== info.id) ? "bg-green-400" : "bg-gray-400"}`}
                        ></div>
                      </div>
                      <div className="mb-auto ml-[1rem] flex w-[60%] flex-col">
                        {/* MARK: TITLE */}
                        <CustomLabel
                          className={`${item.id === conversations.selected?.id ? "text-[var(--text-sub-color)]" : "text-[var(--text-main-color)]"} 
                          font-['Be_Vietnam_Pro'] font-semibold`}
                          title={
                            item.isGroup
                              ? item.title
                              : item.members.find(
                                  (item) => item.contact.id !== info.id,
                                )?.contact.name
                          }
                        />
                        {/* MARK: LAST MESSAGE */}
                        {item.lastMessage ? (
                          <p className="mt-1 truncate text-sm text-gray-600">
                            <CustomLabel
                              className={`
                              ${
                                item.id === conversations.selected?.id
                                  ? "text-[var(--text-sub-color-thin)]"
                                  : item.unSeen
                                    ? "text-[var(--danger-text-color)]"
                                    : "text-[var(--text-main-color-blur)]"
                              }`}
                              title={item.lastMessage}
                            />
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                      {/* MARK: LAST MESSAGE TIME */}
                      {item.lastMessageTime === null ? (
                        ""
                      ) : (
                        <div
                          className={`ml-auto flex aspect-square flex-col items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 laptop:w-[2.5rem]`}
                        >
                          <p>
                            {item.lastMessageTime === null
                              ? ""
                              : moment(item.lastMessageTime).fromNow()}
                          </p>
                        </div>
                        // <span className="aspect-square w-[3rem] rounded-full bg-gray-300 px-2 py-1 text-xs text-gray-500">
                        //   {moment(item.lastMessageTime).fromNow()}
                        // </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </ListchatFilterProvider>
  );
};

export default ListChatContainer;
