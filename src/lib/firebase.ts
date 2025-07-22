import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'teampulse-1nd5v',
  appId: '1:39965869169:web:17adb1916c707a1d7bc7d0',
  storageBucket: 'teampulse-1nd5v.firebasestorage.app',
  apiKey: 'AIzaSyCPxaGTwMM-JX53-DPj9hUf2SP2cHOjOrk',
  authDomain: 'teampulse-1nd5v.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '39965869169',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
