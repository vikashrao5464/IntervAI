
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "intervai-99770.firebaseapp.com",
  projectId: "intervai-99770",
  storageBucket: "intervai-99770.firebasestorage.app",
  messagingSenderId: "1084755134235",
  appId: "1:1084755134235:web:c75eedc07b170e9b39f5be"
};


const app = initializeApp(firebaseConfig);

const auth=getAuth(app);
const provider=new GoogleAuthProvider();
export {auth,provider};