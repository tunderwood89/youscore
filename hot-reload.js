const filesInDirectory = (dir) =>
    new Promise((resolve) =>
      dir.createReader().readEntries((entries) =>
        Promise.all(
          entries
            .filter((e) => e.name[0] !== ".") // Ignore hidden files
            .map((e) =>
              e.isDirectory
                ? filesInDirectory(e)
                : new Promise((res) => e.file(res))
            )
        )
          .then((files) => [].concat(...files))
          .then(resolve)
      )
    );
  
  const timestampForFilesInDirectory = (dir) =>
    filesInDirectory(dir).then((files) =>
      files.map((f) => f.lastModified).join()
    );
  
  const watchChanges = (dir) => {
    let lastTimestamp;
  
    const checkForChanges = () => {
      timestampForFilesInDirectory(dir).then((timestamp) => {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        } else if (lastTimestamp !== timestamp) {
          console.log("🔄 Extension updated! Reloading...");
          chrome.runtime.reload(); // Reload extension
        }
        setTimeout(checkForChanges, 1000); // Check every second
      });
    };
  
    checkForChanges();
  };
  
  chrome.management.getSelf((self) => {
    if (self.installType === "development") {
      console.log("🔄 Hot Reload is active!");
      chrome.runtime.getPackageDirectoryEntry(watchChanges);
    }
  });
  