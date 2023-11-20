importScripts(
  "https://www.gstatic.com/firebasejs/10.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-compat.js",
);

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
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  // Customize notification here
  // const notificationTitle = "Background Message Title";
  // const notificationOptions = {
  //   body: "Background Message body.",
  //   icon: "/firebase-logo.png",
  // };

  // self.registration.showNotification(notificationTitle, notificationOptions);
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ msg: "Hello from SW" }));
  });
});
