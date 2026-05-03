import { getMessaging, getToken, onMessage } from "firebase/messaging";
import HttpRequest from "../lib/fetch";
import { NotificationData, NotificationModel, RequestPermission } from "../types/base.types";
import getFirebaseApp from "../utils/firebaseConfig";

const page = 1;
const limit = 10;

export const getNotifications = async (): Promise<NotificationModel[]> =>
  (
    await HttpRequest<undefined, NotificationModel[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET.replace("{page}", page).replace(
        "{limit}",
        limit,
      ),
    })
  ).data ?? [];

export const read = async (id: string) =>
  (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GETBYID.replace("{id}", id),
    })
  ).data;

export const readAll = async () =>
  (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET,
    })
  ).data;

export const registerConnection = async (token: string) =>
  (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_REGISTER.replace("{token}", token),
    })
  ).data;

const app = getFirebaseApp();
const messaging = getMessaging(app);

export const requestPermission = ({
  registerConnection,
  onNotification,
}: RequestPermission) => {
  Notification.requestPermission().then((permission) => {
    if (permission !== "granted") return;
    getToken(messaging, {
      vapidKey:
        "BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM",
    })
      .then((token) => {
        if (!token) return;
        onMessage(messaging, (payload) => {
          if (onNotification && payload.data) {
            onNotification({
              event: payload.data.event,
              data: JSON.parse(payload.data.data ?? "{}"),
            } as NotificationData);
          }
        });
        registerConnection(token);
      })
      .catch(() => {});
  });
};

export const registerSW = () => {
  const sw = navigator.serviceWorker;
  if (sw) {
    return sw
      .register("/firebase-messaging-sw.js", {
        scope: "firebase-cloud-messaging-push-scope",
      })
      .then(() => sw.ready);
  }
};

export { classifyNotification } from "../utils/notificationHandlers";
