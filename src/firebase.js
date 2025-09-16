// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEoYT-C20WPGQKiDknVuqAIBrSWrHqRoQ",
  authDomain: "datachem-f3ba3.firebaseapp.com",
  projectId: "datachem-f3ba3",
  storageBucket: "datachem-f3ba3.firebasestorage.app",
  messagingSenderId: "560769625524",
  appId: "1:560769625524:web:3122131e2f221a7cb256e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
export default app;