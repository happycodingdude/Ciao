// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import firebase, { initializeApp } from "firebase/app";
import "firebase/messaging";
// import { firebaseConfig } from './constants';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB7JnGdGGjcoFN3gR8XPVu4nYpVSORuVnA",
    authDomain: "myconnect-f2af8.firebaseapp.com",
    projectId: "myconnect-f2af8",
    storageBucket: "myconnect-f2af8.appspot.com",
    messagingSenderId: "191922075446",
    appId: "1:191922075446:web:72ab430046b40d39e22597",
    measurementId: "G-8Q1N0TGXLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let messaging = firebase.messaging();

export const getMessagingToken = async () => {
    let currentToken = "";
    if (!messaging) return;
    try {
        currentToken = await messaging.getToken({
            vapidKey: 'BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM',
        });
        console.log("FCM registration token", currentToken);
    } catch (error) {
        console.log("An error occurred while retrieving token. ", error);
    }
    return currentToken;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        messaging.onMessage((payload) => {
            resolve(payload);
        });
    });