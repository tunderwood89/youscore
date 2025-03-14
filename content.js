import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEtWzU5n1MF00w6WTg2TRCiwihrO9fJOk",
    authDomain: "youscore-db1.firebaseapp.com",
    projectId: "youscore-db1",
    storageBucket: "youscore-db1.firebasestorage.app",
    messagingSenderId: "749360914815",
    appId: "1:749360914815:web:d13a35f2a3ece2d1b0ba4a",
    measurementId: "G-JXB1K8WT6B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

signInAnonymously(auth).catch(error => console.error("Firebase Auth Error:", error));

async function fetchRating(channelName) {
    const docRef = doc(db, "ratings", channelName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            average: data.averageRating || "?",
            count: data.ratings ? data.ratings.length : 0
        };
    }
    return { average: "?", count: 0 };
}

async function submitRating(channelName, userId, rating) {
    const docRef = doc(db, "ratings", channelName);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        const ratings = data.ratings || [];
        const userRatings = data.userRatings || {};
        
        if (userRatings[userId]) return;
        
        ratings.push(rating);
        userRatings[userId] = rating;
        const averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
        
        await updateDoc(docRef, {
            ratings: arrayUnion(rating),
            userRatings,
            averageRating: Number(averageRating)
        });
    } else {
        await setDoc(docRef, {
            ratings: [rating],
            userRatings: { [userId]: rating },
            averageRating: rating
        });
    }
}

async function insertRatingSystem() {
    document.querySelectorAll("ytd-channel-name").forEach(async channel => {
        if (!channel.querySelector(".youscore-rating")) {
            const channelName = channel.textContent.trim();
            const { average, count } = await fetchRating(channelName);
            
            const ratingContainer = document.createElement("div");
            ratingContainer.className = "youscore-rating";
            ratingContainer.innerText = `${average} (${count})`;
            ratingContainer.style.marginLeft = "10px";
            ratingContainer.style.padding = "4px 8px";
            ratingContainer.style.background = "#f1f1f1";
            ratingContainer.style.borderRadius = "12px";
            ratingContainer.style.fontWeight = "bold";
            ratingContainer.style.fontSize = "12px";
            
            const input = document.createElement("input");
            input.type = "number";
            input.min = "1";
            input.max = "100";
            input.placeholder = "Rate";
            input.style.marginLeft = "5px";
            input.style.width = "40px";
            
            const submitButton = document.createElement("button");
            submitButton.innerText = "✓";
            submitButton.style.marginLeft = "5px";
            submitButton.style.cursor = "pointer";
            submitButton.style.padding = "2px 6px";
            submitButton.style.borderRadius = "5px";
            submitButton.style.border = "none";
            submitButton.style.background = "#007BFF";
            submitButton.style.color = "white";
            submitButton.style.fontSize = "12px";
            
            submitButton.onclick = async () => {
                const userId = auth.currentUser.uid;
                const userRating = parseInt(input.value);
                if (userRating >= 1 && userRating <= 100) {
                    await submitRating(channelName, userId, userRating);
                    const updatedRating = await fetchRating(channelName);
                    ratingContainer.innerText = `${updatedRating.average} (${updatedRating.count})`;
                }
            };
            
            channel.appendChild(ratingContainer);
            channel.appendChild(input);
            channel.appendChild(submitButton);
        }
    });
}

const observer = new MutationObserver(insertRatingSystem);
observer.observe(document.body, { childList: true, subtree: true });
insertRatingSystem();
