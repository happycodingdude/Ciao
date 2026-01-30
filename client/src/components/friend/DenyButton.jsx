import CustomButton from "../../../components/CustomButton";
import { useAuth } from "../../hook/CustomHooks";
import HttpRequest from "../../lib/fetch";

const DenyButton = (props) => {
  const { request, onClose, className } = props;
  const auth = useAuth();

  const acceptFriendRequest = () => {
    const body = [
      {
        op: "replace",
        path: "Status",
        value: "friend",
      },
      {
        op: "replace",
        path: "AcceptTime",
        value: moment().format("YYYY/MM/DD HH:mm:ss"),
      },
    ];
    HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID_INCLUDENOTIFY.replace(
        "{id}",
        request.Id,
      ),
      token: auth.token,
      data: body,
    }).then((res) => {
      onClose();
    });
  };

  return <CustomButton title="Deny" className={className} onClick={() => {}} />;
};

export default DenyButton;
