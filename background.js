import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

chrome.storage.local.get("firebaseConfig", async (data) => {
    if (data.firebaseConfig) {
        const app = initializeApp(data.firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.action === "signIn") {
                signInWithPopup(auth, provider)
                    .then((result) => sendResponse({ success: true, user: result.user.displayName }))
                    .catch((error) => sendResponse({ success: false, error: error.message }));
                return true;
            }

            if (message.action === "submitRating") {
                const user = auth.currentUser;
                if (!user) {
                    sendResponse({ success: false, error: "Not signed in" });
                    return;
                }

                const channelRef = doc(db, "ratings", message.channel);
                const channelSnap = await getDoc(channelRef);

                let ratings = channelSnap.exists() ? channelSnap.data().ratings : {};
                ratings[user.uid] = message.rating;

                const values = Object.values(ratings);
                const avg = values.reduce((a, b) => a + b, 0) / values.length;

                await setDoc(channelRef, { ratings, average: avg });

                sendResponse({ success: true, average: avg });
            }
        });
    }
});
