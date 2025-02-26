import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyCZZq1UfrIIcjsbZe3JTyEMQ2xa0NkZoBo",
    authDomain: "hogweed-map.firebaseapp.com",
    projectId: "hogweed-map",
    storageBucket: "hogweed-map.firebasestorage.app",
    messagingSenderId: "790762617108",
    appId: "1:790762617108:web:bdcabebbf639f66eaeaa01",
    measurementId: "G-HG7MFQSGNM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);