import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCkQU5JrkeRn7LPv7GfndQ17LMP8ms8-o4",
    authDomain: "tu-punto-dulce-web.firebaseapp.com",
    projectId: "tu-punto-dulce-web",
    storageBucket: "tu-punto-dulce-web.firebasestorage.app",
    messagingSenderId: "908972948764",
    appId: "1:908972948764:web:8db90f91e7e084c893ced9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
