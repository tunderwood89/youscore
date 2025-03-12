chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        firebaseConfig: {
            apiKey: "AIzaSyCEtWzU5n1MF00w6WTg2TRCiwihrO9fJOk",
            authDomain: "youscore-db1.firebaseapp.com",
            projectId: "youscore-db1",
            storageBucket: "youscore-db1.firebasestorage.app",
            messagingSenderId: "749360914815",
            appId: "1:749360914815:web:d13a35f2a3ece2d1b0ba4a"
        }
    });
});
