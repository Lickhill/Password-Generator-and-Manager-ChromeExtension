chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.sync.set({ passwords: [] }, function () {
		console.log("Password storage initialized");
	});
});
