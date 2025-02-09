document.getElementById("language-selector").addEventListener("change", function () {
    const selectedLang = this.value;
    document.querySelectorAll("[data-lang]").forEach(el => {
        el.style.display = el.getAttribute("data-lang") === selectedLang ? "inline" : "none";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const reminderForm = document.getElementById("reminder-form");
    const reminderTable = document.getElementById("reminder-list");
    const expiryWarningDiv = document.getElementById("expiry-warning");

    // Popup Elements
    const popup = document.getElementById("reminder-popup");
    const popupMessage = document.getElementById("popup-message");
    const btnTaken = document.getElementById("btn-taken");
    const btnSnooze = document.getElementById("btn-snooze");

    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust timezone
    document.getElementById("date-time").value = now.toISOString().slice(0, 16);

    function loadReminders() {
        const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
        const reminderTable = document.getElementById("reminder-list");
        const expiryWarningDiv = document.getElementById("expiry-warning");
        reminderTable.innerHTML = "";
        let hasExpiredMeds = false;
    
        // Sort reminders by nearest date-time first
        reminders.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    
        if (reminders.length === 0) {
            reminderTable.innerHTML = `<tr><td colspan="7" style="text-align:center; color: gray;">No medication reminders yet.</td></tr>`;
            expiryWarningDiv.style.display = "none";
            return;
        }
    
        reminders.forEach((reminder, index) => {
            const expiryDate = new Date(reminder.expiryDate);
            const today = new Date();
            let expiryWarning = "";
    
            if (expiryDate < today) {
                expiryWarning = "⚠ Expired";
                hasExpiredMeds = true;
            } else if ((expiryDate - today) < 3 * 24 * 60 * 60 * 1000) { // Expiring in less than 3 days
                expiryWarning = "⚠ Expiring Soon!";
            }
    
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${reminder.pill}</td>
                <td>${reminder.dosage} mg/ml</td>
                <td>${reminder.frequency}</td>
                <td>${new Date(reminder.dateTime).toLocaleString()}</td>
                <td>${reminder.specialInstructions}</td>
                <td style="color: ${expiryWarning.includes("Expired") ? "red" : expiryWarning.includes("Expiring Soon") ? "orange" : "black"}; font-weight:bold;">
                    ${reminder.expiryDate} ${expiryWarning}
                </td>
                <td>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            reminderTable.appendChild(row);
        });
    
        // Show warning message if any expired medications exist
        expiryWarningDiv.style.display = hasExpiredMeds ? "block" : "none";
    
        // Attach event listeners to delete buttons
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                removeReminder(index);
            });
        });
    }    

    function saveReminder(pill, dosage, frequency, dateTime, specialInstructions, expiryDate) {
        const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
        reminders.push({ pill, dosage, frequency, dateTime, specialInstructions, expiryDate, notified: false });
        localStorage.setItem("reminders", JSON.stringify(reminders));
        loadReminders();
    }

    function removeReminder(index) {
        let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    
        index = parseInt(index);
        if (index >= 0 && index < reminders.length) {
            reminders.splice(index, 1);
            localStorage.setItem("reminders", JSON.stringify(reminders));
            loadReminders();
        }
    }    

    // Check and notify user about reminders
    function checkReminders() {
        const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
        const now = new Date();

        reminders.forEach((reminder, index) => {
            const reminderTime = new Date(reminder.dateTime);

            if (reminderTime <= now && !reminder.notified) {
                showPopup(reminder, index);
                reminders[index].notified = true; // Mark as notified
            }
        });

        localStorage.setItem("reminders", JSON.stringify(reminders));
    }

    // Show custom popup notification
    function showPopup(reminder, index) {
        playAlertSound();

        let expiryWarning = "";
        if (new Date(reminder.expiryDate) < new Date()) {
            expiryWarning = "<br><strong style='color: red;'>⚠ Expired!</strong>";
        } else if ((new Date(reminder.expiryDate) - new Date()) < 3 * 24 * 60 * 60 * 1000) {
            expiryWarning = "<br><strong style='color: orange;'>⚠ Expiring Soon!</strong>";
        }

        popupMessage.innerHTML = `
            It's time to take <strong>${reminder.pill}</strong><br>
            Dosage: <strong>${reminder.dosage} mg/ml</strong>
            ${expiryWarning}
        `;

        popup.style.display = "flex"; // Show popup

        // "Pills Taken" Button
        btnTaken.onclick = () => {
            popup.style.display = "none"; // Close popup
            markReminderAsTaken(index);
        };

        // "Give me 10 minutes" Button
        btnSnooze.onclick = () => {
            popup.style.display = "none"; // Close popup
            snoozeReminder(index);
        };
    }

    // Play alert sound
    function playAlertSound() {
        let audio = new Audio("reminder-sound.mp3");
        audio.play().catch(error => console.log("Audio autoplay blocked:", error));
    }

    // Mark reminder as taken (remove it)
    function markReminderAsTaken(index) {
        const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
        reminders.splice(index, 1); // Remove the reminder
        localStorage.setItem("reminders", JSON.stringify(reminders));
        loadReminders(); // Refresh list
    }

    // Snooze reminder for 10 minutes
    function snoozeReminder(index) {
        const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
        let reminder = reminders[index];

        const newTime = new Date(reminder.dateTime);
        newTime.setMinutes(newTime.getMinutes() + 10);
        reminder.dateTime = newTime.toISOString();
        reminder.notified = false; // Reset notification status

        localStorage.setItem("reminders", JSON.stringify(reminders));
        loadReminders();
    }

    reminderForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const pillName = document.getElementById("pill-name").value.trim();
        const dosage = document.getElementById("dosage").value.trim();
        const frequency = document.getElementById("frequency").value;
        const dateTime = document.getElementById("date-time").value;
        const specialInstructions = document.getElementById("special-instructions").value;
        const expiryDate = document.getElementById("expiry-date").value;

        if (pillName && dosage && frequency && dateTime && expiryDate) {
            saveReminder(pillName, dosage, frequency, dateTime, specialInstructions, expiryDate);
            reminderForm.reset();
        }
    });

    // Check reminders every 10 seconds
    checkReminders();
    setInterval(checkReminders, 10000);

    loadReminders();
});