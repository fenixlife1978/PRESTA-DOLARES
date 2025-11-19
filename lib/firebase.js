// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUkC09n2_cda6A2LlxYaTIAk1ryToG4So",
  authDomain: "studio-7477614292-e09e8.firebaseapp.com",
  projectId: "studio-7477614292-e09e8",
  storageBucket: "studio-7477614292-e09e8.appspot.com",
  messagingSenderId: "504587138122",
  appId: "1:504587138122:web:ee4f898ca407134d3ea2b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
