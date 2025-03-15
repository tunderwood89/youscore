// Function to create the rating circle
function createRatingCircle(score) {
    const circle = document.createElement('div');
    circle.className = 'youscore-rating-circle';
    circle.textContent = score; // Display the score
    return circle;
}

// Function to extract the channel ID
function getChannelId() {
    const channelLink = document.querySelector('ytd-video-owner-renderer a[href*="/channel/"]');
    if (channelLink) {
        const href = channelLink.getAttribute('href');
        const channelId = href.split('/channel/')[1];
        return channelId;
    }
    return null;
}

// Function to fetch the YouTuber's score (placeholder for now)
async function fetchYouTuberScore(channelId) {
    // Replace this with your API call to fetch the score
    return 85; // Placeholder score
}

// Function to insert the rating circle next to the avatar
async function insertRatingCircle() {
    const channelContainer = document.querySelector('ytd-video-owner-renderer #channel-name');
    if (channelContainer) {
        const channelId = getChannelId();
        if (channelId) {
            const score = await fetchYouTuberScore(channelId);
            const ratingCircle = createRatingCircle(score);
            channelContainer.parentElement.insertBefore(ratingCircle, channelContainer.nextSibling);
        }
    }
}

// Wait for the page to load
document.addEventListener('DOMContentLoaded', insertRatingCircle);

// Handle dynamic page changes (e.g., navigating between videos)
const observer = new MutationObserver(insertRatingCircle);
observer.observe(document.body, { childList: true, subtree: true });