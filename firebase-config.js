import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
const firebaseConfig = {
apiKey: "AIzaSyCgt4XVsPxcI2XfKKdCEWxZTHgFOX2tRew",
authDomain: "hr-backoffice-shared.firebaseapp.com",
projectId: "hr-backoffice-shared",
storageBucket: "hr-backoffice-shared.firebasestorage.app",
messagingSenderId: "816300633926",
appId: "1:816300633926:web:5841f03a3936c563fbff47"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
