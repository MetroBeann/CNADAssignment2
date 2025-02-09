// Function to change language dynamically
function changeLanguage() {
    let selectedLang = document.getElementById("language-selector").value;
  
    // Update text elements
    document.querySelectorAll("[data-lang]").forEach(element => {
        element.style.display = element.getAttribute("data-lang") === selectedLang ? "inline" : "none";
    });
  
    // Update placeholder attributes
    document.querySelectorAll("[data-lang-placeholder]").forEach(element => {
        let placeholders = JSON.parse(element.getAttribute("data-lang-placeholder"));
        element.placeholder = placeholders[selectedLang];
    });
  }
  
  // Run language function on page load
  document.addEventListener("DOMContentLoaded", changeLanguage);