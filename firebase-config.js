import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgt4XVsPxcI2XfKKdCEWxZTHgFOX2tRew",
  authDomain: "hr-backoffice-shared.firebaseapp.com",
  projectId: "hr-backoffice-shared",
  storageBucket: "hr-backoffice-shared.firebasestorage.app",
  messagingSenderId: "816300633926",
  appId: "1:816300633926:web:5841f03a3936c563fbff47"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
