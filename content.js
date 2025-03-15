// Function to create the score circle
function createScoreCircle(score) {
    const circle = document.createElement('div');
    circle.className = 'youscore-circle';
    circle.textContent = score; // Display the score
    return circle;
}

// Function to insert the score circle next to the avatar
function insertScoreCircle() {
    const avatarContainer = document.querySelector('ytd-video-owner-renderer #owner');
    if (avatarContainer) {
        // Fetch or calculate the score (placeholder for now)
        const score = 85; // Replace with your logic to fetch the score

        // Create and insert the score circle
        const scoreCircle = createScoreCircle(score);
        avatarContainer.appendChild(scoreCircle);
    }
}

// Wait for the page to load
document.addEventListener('DOMContentLoaded', insertScoreCircle);

// Handle dynamic page changes (e.g., navigating between videos)
const observer = new MutationObserver(insertScoreCircle);
observer.observe(document.body, { childList: true, subtree: true });

async function fetchYouTuberScore(channelId) {
    const response = await fetch(`https://api.youscore.com/scores/${channelId}`);
    const data = await response.json();
    return data.score;
}

// Modify the insertScoreCircle function to fetch the score
async function insertScoreCircle() {
    const avatarContainer = document.querySelector('ytd-video-owner-renderer #owner');
    if (avatarContainer) {
        const channelId = getChannelId(); // Implement this function to extract the channel ID
        const score = await fetchYouTuberScore(channelId);

        const scoreCircle = createScoreCircle(score);
        avatarContainer.appendChild(scoreCircle);
    }
}
