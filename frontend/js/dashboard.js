// Default language
let currentLang = "en";

// Function to change language
function changeLanguage() {
    let selectedLang = document.getElementById("language-selector").value;
    currentLang = selectedLang;

    // Show only selected language
    document.querySelectorAll("[data-lang]").forEach(element => {
        element.style.display = element.getAttribute("data-lang") === selectedLang ? "inline" : "none";
    });
}

// Run language function on page load
document.addEventListener("DOMContentLoaded", changeLanguage);