import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
// import notifyMessage, {
//   NotifyMessage,
//   NotifyMessageModel,
// } from "../features/notification/services/notifyMessage";
import { RequestPermission } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyB7JnGdGGjcoFN3gR8XPVu4nYpVSORuVnA",
  authDomain: "myconnect-f2af8.firebaseapp.com",
  projectId: "myconnect-f2af8",
  storageBucket: "myconnect-f2af8.appspot.com",
  messagingSenderId: "191922075446",
  appId: "1:191922075446:web:72ab430046b40d39e22597",
  measurementId: "G-8Q1N0TGXLZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to set up message listener
// export const setupMessageListener = (
//   queryClient: QueryClient,
//   info: UserProfile,
// ) => {
//   // Receive message
//   onMessage(messaging, (payload) => {
//     console.log("Message received. ", payload.data);
//     const message: NotifyMessageModel = {
//       message: payload.data as NotifyMessage,
//       queryClient: queryClient,
//       info: info,
//     };
//     notifyMessage(message);
//   });
// };

export const requestPermission = ({
  registerConnection,
  // notifyMessage,
  // queryClient,
  // info,
}: RequestPermission) => {
  Notification.requestPermission().then((permission) => {
    if (permission == "granted") {
      return getToken(messaging, {
        vapidKey:
          "BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM",
      })
        .then((token) => {
          // console.log(token);
          if (token) {
            // Receive message
            // onMessage(messaging, (payload) => {
            //   console.log("Message received. ", payload.data);
            //   const message: NotifyMessageModel = {
            //     message: payload.data as NotifyMessage,
            //     queryClient: queryClient,
            //     info: info,
            //   };
            //   notifyMessage(message);
            // });

            registerConnection(token);
          } else console.log("Token failed");
        })
        .catch((err) => {
          console.log("Error: ", err);
        });
    }
  });
};

export const registerSW = () => {
  const sw = navigator.serviceWorker;
  if (sw) {
    return sw
      .register("/firebase-messaging-sw.js", {
        scope: "firebase-cloud-messaging-push-scope", // mandatory value
      })
      .then(() => sw.ready);
  }
};

// export const listenNotification = (action) => {
//   if (navigator.serviceWorker) {
//     navigator.serviceWorker
//       .register("/firebase-messaging-sw.js")
//       .then(navigator.serviceWorker.ready)
//       .then(() => {
//         navigator.serviceWorker.onmessage = (event) => {
//           const message = event.data.data;
//           // event is a MessageEvent object
//           console.log(`The service worker sent me a message: ${message}`);
//           action(message);
//         };

//         // navigator.serviceWorker.addEventListener("message", (event) => {
//         //   const message = event.data.data;
//         //   // event is a MessageEvent object
//         //   console.log(`The service worker sent me a message: ${message}`);
//         //   action(message);
//         // });
//       });

//     // navigator.serviceWorker.addEventListener("message", (event) => {
//     //   // event is a MessageEvent object
//     //   console.log(`The service worker sent me a message: ${event.data}`);
//     // });
//   }
// };
