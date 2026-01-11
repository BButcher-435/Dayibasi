// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// BURAYI KENDİ PROJE BİLGİLERİNLE DOLDUR:
const firebaseConfig = {
  apiKey: "AIzaSyDSKu3hBGsVQA1uUioTuAv3ke-r5nUvsY8",
  authDomain: "isbul-bc33d.firebaseapp.com",
  projectId: "isbul-bc33d",
  storageBucket: "isbul-bc33d.firebasestorage.app",
  messagingSenderId: "525213483254",
  appId: "1:525213483254:web:89922627f374a582532cd7"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   