// Inject the rating circle next to YouTubers' names
function injectRatingCircle(youtuberName) {
    const ratingCircle = document.createElement("div");
    ratingCircle.className = "youscore-rating-circle";
    ratingCircle.dataset.youtuber = youtuberName;
    ratingCircle.innerText = "0"; // Default score
    ratingCircle.addEventListener("click", () => openRatingPopup(youtuberName));
    const youtuberElement = document.querySelector(`a[title="${youtuberName}"]`);
    if (youtuberElement) {
      youtuberElement.parentNode.insertBefore(ratingCircle, youtuberElement.nextSibling);
    }
  }
  
  // Fetch and display the average rating from Firebase
  async function fetchAverageRating(youtuberName) {
    const response = await fetch(`https://your-firebase-db-url/youtubers/${youtuberName}.json`);
    const data = await response.json();
    return data?.averageRating || 0;
  }
  
  // Open a popup to rate the YouTuber
  function openRatingPopup(youtuberName) {
    const rating = prompt(`Rate ${youtuberName} (1-100):`);
    if (rating >= 1 && rating <= 100) {
      submitRating(youtuberName, rating);
    }
  }
  
  // Submit the rating to Firebase
  async function submitRating(youtuberName, rating) {
    const response = await fetch(`https://your-firebase-db-url/youtubers/${youtuberName}/ratings.json`, {
      method: "POST",
      body: JSON.stringify({ userId: "anonymous123", rating: parseInt(rating) }),
    });
    if (response.ok) {
      updateAverageRating(youtuberName);
    }
  }
  
  // Update the average rating displayed
  async function updateAverageRating(youtuberName) {
    const response = await fetch(`https://your-firebase-db-url/youtubers/${youtuberName}/ratings.json`);
    const ratings = await response.json();
    const total = Object.values(ratings).reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (total / Object.keys(ratings).length).toFixed(1);
    await fetch(`https://your-firebase-db-url/youtubers/${youtuberName}.json`, {
      method: "PATCH",
      body: JSON.stringify({ averageRating }),
    });
    const ratingCircle = document.querySelector(`.youscore-rating-circle[data-youtuber="${youtuberName}"]`);
    if (ratingCircle) {
      ratingCircle.innerText = averageRating;
    }
  }
  
  // Main function to scan the page for YouTubers' names
  function scanPage() {
    const youtuberLinks = document.querySelectorAll("a[title]");
    youtuberLinks.forEach((link) => {
      const youtuberName = link.getAttribute("title");
      if (!document.querySelector(`.youscore-rating-circle[data-youtuber="${youtuberName}"]`)) {
        injectRatingCircle(youtuberName);
        fetchAverageRating(youtuberName).then((averageRating) => {
          const ratingCircle = document.querySelector(`.youscore-rating-circle[data-youtuber="${youtuberName}"]`);
          if (ratingCircle) {
            ratingCircle.innerText = averageRating;
          }
        });
      }
    });
  }
  
  // Run the scanner every 2 seconds
  setInterval(scanPage, 2000);