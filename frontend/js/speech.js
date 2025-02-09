// Function to Convert Text to Speech
function speakText(button) {
    let text = button.parentElement.innerText.replace(/🔊$/, "").trim(); // Get text excluding button icon
    // Get selected language
    let selectedLanguage = document.getElementById("language-select").value;


    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage; // Apply selected language
    speechSynthesis.speak(utterance);
}

// Function to Change Language
function changeLanguage() {
    let selectedLanguage = document.getElementById("language-select").value;

    
    // Map language codes to custom attributes
    let langMap = {
        "en-US": "en",
        "ms-MY": "ms",
        "zh-CN": "zh"
    };

    let langAttr = langMap[selectedLanguage];

    // Hide all other translations and show selected language
    document.querySelectorAll("[data-lang]").forEach(el => {
        if (el.getAttribute("data-lang") === langAttr) {
            el.style.display = "inline";
        } else {
            el.style.display = "none";
        }
    });

    console.log("Language changed to:", selectedLanguage);
}
