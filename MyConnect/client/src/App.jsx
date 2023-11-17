import "firebase/messaging";
// import { getMessaging } from "firebase/messaging/sw";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Route, Routes } from 'react-router-dom';
import RequireAuth from '../src/context/RequireAuth';
import './App.css';
import Home from './Home';
import Header from './components/Header';
// import { getMessagingToken, onMessageListener } from './components/Notification';

function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyB7JnGdGGjcoFN3gR8XPVu4nYpVSORuVnA",
    authDomain: "myconnect-f2af8.firebaseapp.com",
    projectId: "myconnect-f2af8",
    storageBucket: "myconnect-f2af8.appspot.com",
    messagingSenderId: "191922075446",
    appId: "1:191922075446:web:72ab430046b40d39e22597",
    measurementId: "G-8Q1N0TGXLZ"
  };
  const messaging = getMessaging(firebaseConfig);
  // Add the public key generated from the console here.
  getToken(messaging, { vapidKey: "BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM" });
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // ...
  });

  // Initialize Firebase
  // const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);

  // if (!firebase.apps.length) {
  //   firebase.initializeApp(firebaseConfig);
  // } else {
  //   firebase.app(); // if already initialized, use that one
  // }

  // const messaging1 = getMessaging();
  // onMessage(messaging1, (payload) => {
  //   console.log('Message received. ', payload);
  //   // ...
  // });

  // let messaging = firebase.messaging();

  // if (typeof window !== "undefined") {
  //   if (firebase.messaging.isSupported()) {
  //     messaging = firebase.messaging();
  //   }
  // }

  // const getMessagingToken = async () => {
  //   let currentToken = "";
  //   if (!messaging) return;
  //   try {
  //     currentToken = await messaging.getToken({
  //       vapidKey: 'BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM',
  //     });
  //     console.log("FCM registration token", currentToken);
  //   } catch (error) {
  //     console.log("An error occurred while retrieving token. ", error);
  //   }
  //   return currentToken;
  // };

  // const onMessageListener = () =>
  //   new Promise((resolve) => {
  //     messaging.onMessage((payload) => {
  //       resolve(payload);
  //     });
  //   });
  // useEffect(() => {
  //   getMessagingToken();
  // }, [])
  // useEffect(() => {
  //   onMessageListener().then(data => {
  //     console.log("Receive foreground: ", data)
  //   })
  // })

  return (
    <div className='text-[clamp(1.6rem,1.3vw,2rem)] flex flex-col w-full [&>*]:px-[2rem]
    bg-gradient-to-r from-purple-100 to-blue-100'>
      <Header />
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
