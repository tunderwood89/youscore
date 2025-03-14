// Inject CSS
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = chrome.runtime.getURL("styles.css");
document.head.appendChild(link);

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
            
            // Create the score display circle
            const scoreCircle = document.createElement("div");
            scoreCircle.className = "youscore-rating";
            scoreCircle.innerText = `${average} (${count})`;
            scoreCircle.style.display = "inline-block";
            scoreCircle.style.marginLeft = "10px";
            scoreCircle.style.padding = "4px 8px";
            scoreCircle.style.background = "#f1f1f1";
            scoreCircle.style.borderRadius =
            scoreCircle.style.borderRadius = "50%";
            scoreCircle.style.fontWeight = "bold";
            scoreCircle.style.fontSize = "12px";
            scoreCircle.style.cursor = "pointer";

            // Add click event to show the rating pop-up
            scoreCircle.onclick = () => {
                showRatingPopup(channelName);
            };

            // Append the score circle next to the channel name
            channel.appendChild(scoreCircle);
        }
    });
}

function showRatingPopup(channelName) {
    // Create the pop-up container
    const popup = document.createElement("div");
    popup.className = "youscore-popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "white";
    popup.style.border = "1px solid #ccc";
    popup.style.padding = "20px";
    popup.style.zIndex = "1000";
    popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";

    // Create input for rating
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "100";
    input.placeholder = "Rate (1-100)";
    input.style.width = "100px";

    // Create submit button
    const submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.style.marginLeft = "10px";
    submitButton.onclick = async () => {
        const userId = auth.currentUser.uid;
        const userRating = parseInt(input.value);
        if (userRating >= 1 && userRating <= 100) {
            await submitRating(channelName, userId, userRating);
            const updatedRating = await fetchRating(channelName);
            alert(`Thank you for rating! New average: ${updatedRating.average} (${updatedRating.count})`);
            document.body.removeChild(popup); // Close the popup
        } else {
            alert("Please enter a rating between 1 and 100.");
        }
    };

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.marginLeft = "10px";
    closeButton.onclick = () => {
        document.body.removeChild(popup); // Close the popup
    };

    // Append elements to the popup
    popup.appendChild(input);
    popup.appendChild(submitButton);
    popup.appendChild(closeButton);
    document.body.appendChild(popup);
}

// Observe changes in the DOM to insert the rating system
const observer = new MutationObserver(insertRatingSystem);
observer.observe(document.body, { childList: true, subtree: true });
insertRatingSystem();
