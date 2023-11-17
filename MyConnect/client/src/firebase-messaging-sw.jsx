import { getMessaging, getToken } from "firebase/messaging";

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging();
getToken(messaging, { vapidKey: 'BM0h2oAh38_Q1ra_BvhpventqyMPRuUJ8Fwseh0IaVuXPfepULakLtaUZHdnVk5sMVCSF4nrvfGNPg0yitS4HBM' }).then((currentToken) => {
    if (currentToken) {
        console.log(currentToken);
        // Send the token to your server and update the UI if necessary
        // ...
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    // ...
});