import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.firebase.apiKey,
  authDomain: Constants.expoConfig.extra.firebase.authDomain,
  databaseURL: Constants.expoConfig.extra.firebase.databaseURL,
  projectId: Constants.expoConfig.extra.firebase.projectId,
  storageBucket: Constants.expoConfig.extra.firebase.storageBucket,
  messagingSenderId: Constants.expoConfig.extra.firebase.messagingSenderId,
  appId: Constants.expoConfig.extra.firebase.appId,
  measurementId: Constants.expoConfig.extra.firebase.measurementId,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);