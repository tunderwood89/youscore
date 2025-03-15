// Function to create the rating circle
function createRatingCircle(score) {
    const circle = document.createElement('div');
    circle.className = 'youscore-rating-circle';
    circle.textContent = score; // Display the score
    return circle;
}

function getChannelId() {
    // Try to find the channel link
    const channelLink = document.querySelector('ytd-video-owner-renderer a[href*="/channel/"], ytd-video-owner-renderer a[href*="/c/"], ytd-video-owner-renderer a[href*="/user/"]');
    if (channelLink) {
        const href = channelLink.getAttribute('href');
        console.log('Channel link:', href);

        // Extract the channel ID or username
        if (href.includes('/channel/')) {
            return href.split('/channel/')[1]; // Extract channel ID
        } else if (href.includes('/c/')) {
            return href.split('/c/')[1]; // Extract custom URL
        } else if (href.includes('/user/')) {
            return href.split('/user/')[1]; // Extract username
        }
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
    // Locate the container for the avatar and channel name
    const channelContainer = document.querySelector('ytd-video-owner-renderer #channel-name');
    if (channelContainer) {
        console.log('Channel container found:', channelContainer);
        const channelId = getChannelId();
        if (channelId) {
            console.log('Channel ID:', channelId);
            const score = await fetchYouTuberScore(channelId);
            console.log('Score:', score);
            const ratingCircle = createRatingCircle(score);

            // Insert the circle next to the avatar
            const avatarContainer = channelContainer.closest('ytd-video-owner-renderer');
            if (avatarContainer) {
                avatarContainer.insertBefore(ratingCircle, channelContainer.nextSibling);
                console.log('Rating circle inserted.');
            } else {
                console.error('Avatar container not found.');
            }
        } else {
            console.error('Channel ID not found.');
        }
    } else {
        console.error('Channel container not found.');
    }
}

// Wait for the page to load
document.addEventListener('DOMContentLoaded', insertRatingCircle);

// Handle dynamic page changes (e.g., navigating between videos)
const observer = new MutationObserver(insertRatingCircle);
observer.observe(document.body, { childList: true, subtree: true });