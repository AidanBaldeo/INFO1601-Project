import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Sign up
export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Log in
export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Log out
export function logOut() {
  return signOut(auth);
}

// Listen to auth state changes (call this on app load)
export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
  // callback receives `user` or null
}