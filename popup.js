document.getElementById("sign-in").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "signIn" }, (response) => {
        if (response.success) {
            alert(`Logged in as ${response.user}`);
        } else {
            alert(`Error: ${response.error}`);
        }
    });
});

document.getElementById("submit").addEventListener("click", () => {
    const rating = document.getElementById("rating-slider").value;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const channelName = url.pathname.split("/")[2];

        if (channelName) {
            chrome.runtime.sendMessage({ action: "submitRating", channel: channelName, rating: Number(rating) }, (response) => {
                if (response.success) {
                    alert(`Rating submitted! New average: ${response.average}`);
                } else {
                    alert(`Error: ${response.error}`);
                }
            });
        } else {
            alert("Failed to detect channel name.");
        }
    });
});
