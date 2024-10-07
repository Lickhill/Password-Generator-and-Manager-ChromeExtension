document.addEventListener("DOMContentLoaded", function () {
	const generateBtn = document.getElementById("generateBtn");
	const websiteNameInput = document.getElementById("websiteName");
	const emailInput = document.getElementById("email");
	const passwordOutput = document.getElementById("passwordOutput");
	const message = document.getElementById("message");

	generateBtn.addEventListener("click", function () {
		const websiteName = websiteNameInput.value.trim();
		const email = emailInput.value.trim();

		if (!websiteName || !email) {
			message.textContent = "Please enter both website name and email.";
			return;
		}

		const password = generateStrongPassword();
		passwordOutput.value = password;

		// Copy password to clipboard
		navigator.clipboard.writeText(password).then(
			() => {
				message.textContent = "Password copied to clipboard!";
			},
			() => {
				message.textContent = "Failed to copy password.";
			}
		);

		// Save data to Chrome storage
		chrome.storage.sync.get("passwords", function (data) {
			const passwords = data.passwords || [];
			passwords.push({ websiteName, email, password });
			chrome.storage.sync.set({ passwords: passwords }, function () {
				message.textContent += " Data saved to Chrome storage!";
			});
		});

		// Save data to local CSV file
		saveToCSVFile(websiteName, email, password);

		// Clear input fields
		websiteNameInput.value = "";
		emailInput.value = "";
	});

	function generateStrongPassword() {
		const length = 16;
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
		let password = "";
		for (let i = 0; i < length; i++) {
			password += charset.charAt(
				Math.floor(Math.random() * charset.length)
			);
		}
		return password;
	}

	function saveToCSVFile(websiteName, email, password) {
		const fileName = "password_manager.csv";
		const newEntry = `"${websiteName}","${email}","${password}"\n`;

		chrome.storage.local.get("csvContent", function (data) {
			let content = data.csvContent || "Website,Email,Password\n"; // CSV header
			if (!content.startsWith("Website,Email,Password\n")) {
				content = "Website,Email,Password\n" + content;
			}
			content += newEntry;

			chrome.storage.local.set({ csvContent: content }, function () {
				downloadCSVFile(fileName, content);
			});
		});
	}

	function downloadCSVFile(fileName, content) {
		const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);

		chrome.downloads.download(
			{
				url: url,
				filename: fileName,
				saveAs: false,
				conflictAction: "overwrite",
			},
			function (downloadId) {
				if (chrome.runtime.lastError) {
					console.error(chrome.runtime.lastError);
					message.textContent += " Failed to save to CSV file.";
				} else {
					message.textContent += " Saved to CSV file!";
				}
			}
		);
	}
});
