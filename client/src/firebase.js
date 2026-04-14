import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 👉 NEW

const firebaseConfig = {
  apiKey: "AIzaSyCHH_FknkpyFhYQPYTqm8O60dkHdRrxj0",
  authDomain: "tour-app-607a0.firebaseapp.com",
  projectId: "tour-app-607a0",
  storageBucket: "tour-app-607a0.appspot.com",
  messagingSenderId: "87512737803",
  appId: "1:87512737803:web:23927a42214c3d5bef7f0e",
};

const app = initializeApp(firebaseConfig);

// 👉 NEW PART
const db = getFirestore(app);

// 👉 export
export { db };