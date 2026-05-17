import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./config";

export async function signInWithGoogle() {
 const result = await signInWithPopup(auth, provider);
 return result.user;
}