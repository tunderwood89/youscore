async function fetchRating(channelName) {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/ratings/${channelName}`);
    const data = await response.json();
    return data.fields?.average?.integerValue || "N/A";
}

function createRatingBadge(score) {
    let badge = document.createElement("span");
    badge.textContent = score ? `⭐ ${score}` : "⭐ N/A";
    
    badge.style.padding = "2px 6px";
    badge.style.marginLeft = "8px";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "bold";
    badge.style.borderRadius = "10px";
    badge.style.color = "white";

    badge.style.backgroundColor = score >= 80 ? "#4CAF50" :
                                  score >= 50 ? "#FFC107" :
                                                "#F44336";

    return badge;
}

async function addRatingUI() {
    const channelNames = document.querySelectorAll("#text.ytd-channel-name");

    channelNames.forEach(async channel => {
        if (!channel.dataset.ratingAdded) {
            const avgScore = await fetchRating(channel.textContent);
            const ratingBadge = createRatingBadge(avgScore);
            channel.appendChild(ratingBadge);
            channel.dataset.ratingAdded = "true";
        }
    });
}

setInterval(addRatingUI, 2000);
