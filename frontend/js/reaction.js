document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById("back-to-assessment");

    if (backButton) {
        backButton.addEventListener("click", function () {
            window.location.href = "assessment.html";
        });
    }
});

// Configuration and Constants
const CONFIG = {
    minAge: 60,
    maxAge: 120,
    roundsPerTest: 3,
    delayRange: {
        min: 2000,
        max: 4000
    },
    referenceValues: {
        "65-69": { low: 180, medium: 250, high: 300 },
        "70-74": { low: 200, medium: 270, high: 320 },
        "75-79": { low: 220, medium: 290, high: 340 },
        "80+": { low: 240, medium: 310, high: 360 }
    },
    // New configurations for enhanced tests
    motorPatterns: ['up', 'down', 'left', 'right'],
    mathRange: { min: 1, max: 20 },
    sequenceLength: 4,
    inhibitionRatio: 0.3 // 30% of stimuli should be avoided
};

// Enhanced State Management
let state = {
    stage: 0,
    currentRound: 1,
    results: [],
    startTime: null,
    patientAge: null,
    isActive: false,
    currentSequence: [],
    expectedSequence: [],
    lastStimulus: null,
    consecutiveCorrect: 0
};

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
    });

    // Show the selected screen
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.remove("hidden");
    } else {
        console.error(`Screen with ID '${screenId}' not found`);
    }
}

function updateProgressBar(stage) {
    const progressFill = document.getElementById("progress-fill");
    const currentTest = document.getElementById("current-test");

    if (progressFill && currentTest) {
        let progressPercentage = ((stage + 1) / 4) * 100; // Ensure final stage is 100%

        // When the results screen appears, set progress to full and turn green
        if (stage === 3) {
            progressPercentage = 100;
            currentTest.textContent = "Tests Complete";
            progressFill.classList.add("complete"); // Ensure it applies full green
        } else {
            currentTest.textContent = `Test ${stage + 1}/3`;
        }

        // Update progress bar width and color smoothly
        progressFill.style.width = `${progressPercentage}%`;
        progressFill.style.transition = "width 0.5s ease-in-out";

        if (stage === 3) {
            progressFill.style.backgroundColor = "var(--secondary-color)"; // Green on completion
        } else {
            progressFill.style.backgroundColor = "var(--primary-color)"; // Default blue
        }
    } else {
        console.error("Progress bar elements not found!");
    }
}

// Test Stage Functions
const MAX_ROUNDS = 3; // Number of rounds before moving to the next test

function startVisualTest() {
    console.log("Starting Visual Reaction Test...");
    showScreen("visual-test");
    state.stage = 0;
    updateProgressBar(state.stage);

    state.currentRound = 1; // Reset round count
    runVisualRound(); // Start first round
}

function runVisualRound() {
    console.log(`Round ${state.currentRound} starting...`);
    
    const target = document.getElementById("visual-target");
    const countdownElement = document.getElementById("countdown");
    const reactionTimeElement = document.getElementById("reaction-time");
    const actionButton = document.getElementById("next-visual-round");

    // Reset UI
    target.style.display = "none"; // Hide initially
    countdownElement.classList.remove("hidden");
    reactionTimeElement.textContent = "";
    actionButton.classList.add("hidden");

    let countdown = 3;
    countdownElement.textContent = countdown;

    const countdownInterval = setInterval(() => {
        countdown -= 1;
        console.log("Countdown:", countdown);
        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownElement.classList.add("hidden");
            showTarget();
        } else {
            countdownElement.textContent = countdown;
        }
    }, 1000);
}

function showTarget() {
    console.log("🎯 showTarget() called - Preparing to show target...");
    const target = document.getElementById("visual-target");
    const testArea = document.querySelector(".test-area"); // Get the container

    if (!target || !testArea) {
        console.error("❌ Target element or test area NOT found!");
        return;
    }

    target.style.display = "block"; // Ensure target is visible
    target.style.backgroundColor = "red";

    // Get test area dimensions
    const areaRect = testArea.getBoundingClientRect();
    console.log(`📏 Test Area Dimensions: width=${areaRect.width}, height=${areaRect.height}`);

    // Randomize target size and position **within the test area**
    const size = Math.floor(Math.random() * 50) + 50; // Random size between 50-100px
    const maxX = areaRect.width - size;
    const maxY = areaRect.height - size;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Apply relative positioning within `.test-area`
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;
    target.style.position = "absolute"; // Ensure it's positioned relative to test area
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    console.log(`✅ Target Positioned at: left=${randomX}px, top=${randomY}px inside test area`);

    // Random delay before turning green
    const delay = Math.floor(Math.random() * 2000) + 2000;
    console.log(`⏳ Waiting ${delay}ms before turning green...`);

    setTimeout(() => {
        target.style.backgroundColor = "green";
        state.startTime = Date.now();
        console.log("💚 Target turned GREEN! Ready for click.");
    }, delay);

    // Ensure click event works
    target.onclick = function () {
        if (target.style.backgroundColor === "green") {
            const reactionTime = Date.now() - state.startTime;
            console.log(`✅ Clicked! Reaction Time: ${reactionTime}ms`);
            
            document.getElementById("reaction-time").textContent = `Your reaction time: ${reactionTime}ms`;
            target.style.display = "none"; // Hide after click

            state.results.push({
                type: 'visual',
                time: reactionTime,
                round: state.currentRound
            });

            // Move to next round or test
            const actionButton = document.getElementById("next-visual-round");
            if (state.currentRound < MAX_ROUNDS) {
                state.currentRound++;
                actionButton.textContent = "Begin Next Round";
                actionButton.onclick = runVisualRound;
            } else {
                actionButton.textContent = "Continue to Next Test";
                actionButton.onclick = startAuditoryTest;
            }

            actionButton.classList.remove("hidden");
        }
    };
}

const AUDIO_ROUNDS = 3;

function startAuditoryTest() {
    console.log("Starting Auditory Reaction Test...");
    showScreen("auditory-test");
    state.stage = 1;
    updateProgressBar(state.stage);

    state.currentRound = 1;
    runAuditoryRound();
}

function runAuditoryRound() {
    console.log(`Round ${state.currentRound} starting...`);

    const audioButton = document.getElementById("audio-response-btn");
    const reactionTimeElement = document.getElementById("auditory-reaction-time");
    const actionButton = document.getElementById("next-auditory-round");

    // Reset UI
    audioButton.disabled = true;
    audioButton.textContent = "Wait for the sound...";
    reactionTimeElement.textContent = "";
    actionButton.classList.add("hidden");

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const patterns = [
        { frequency: 440, duration: 200 }, 
        { frequency: 880, duration: 100 },
        { frequency: 220, duration: 300 }
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    // Random delay before sound plays
    const delay = Math.floor(Math.random() * 2000) + 2000;
    console.log("Sound will play in", delay, "ms");

    setTimeout(() => {
        console.log("Playing sound:", pattern.frequency, "Hz");
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(pattern.frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + pattern.duration / 1000);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + pattern.duration / 1000);

        state.startTime = Date.now();

        audioButton.disabled = false;
        audioButton.textContent = "Click Now!";
    }, delay);

    audioButton.onclick = function () {
        if (!audioButton.disabled) {
            const reactionTime = Date.now() - state.startTime;
            reactionTimeElement.textContent = `Your reaction time: ${reactionTime}ms`;
            audioButton.disabled = true;
            audioButton.textContent = "Wait for the next round...";

            console.log(`Round ${state.currentRound} reaction time: ${reactionTime}ms`);

            // Store result
            state.results.push({
                type: 'auditory',
                time: reactionTime,
                round: state.currentRound
            });

            // Check if we need to continue rounds or move to the next test
            if (state.currentRound < AUDIO_ROUNDS) {
                state.currentRound++;
                actionButton.textContent = "Begin Next Round";
                actionButton.onclick = runAuditoryRound;
            } else {
                actionButton.textContent = "Continue to Next Test";
                actionButton.onclick = startSequenceTest;
            }

            actionButton.classList.remove("hidden");
        }
    };
}

const SEQUENCE_ROUNDS = 3; // Number of rounds before moving to the next test

function startSequenceTest() {
    console.log("Starting Sequence Memory Test...");
    showScreen("sequence-test");
    state.stage = 2;
    updateProgressBar(state.stage);

    state.currentRound = 1; // Reset round count
    runSequenceRound(); // Start first round
}

function runSequenceRound() {
    console.log(`🔵 Starting Sequence Round ${state.currentRound}...`);

    const tiles = document.querySelectorAll(".sequence-tile");
    const feedbackElement = document.getElementById("sequence-feedback");
    const actionButton = document.getElementById("next-sequence-round");

    // Reset UI
    feedbackElement.textContent = "👀 Watch the pattern...";
    actionButton.classList.add("hidden");

    state.expectedSequence = [];
    state.currentSequence = [];

    // Increase sequence length gradually
    let sequenceLength = CONFIG.sequenceLength + state.currentRound - 1;

    // Generate random sequence pattern
    for (let i = 0; i < sequenceLength; i++) {
        state.expectedSequence.push(Math.floor(Math.random() * tiles.length));
    }

    console.log("🟢 Generated sequence:", state.expectedSequence);

    // Disable clicking during the animation
    tiles.forEach(tile => tile.classList.add("disabled"));

    // Play the sequence with a delay
    state.expectedSequence.forEach((index, i) => {
        setTimeout(() => {
            highlightTile(tiles[index]);
        }, (i + 1) * 800); // 800ms delay between each highlight
    });

    // Enable clicking after sequence ends
    setTimeout(() => {
        feedbackElement.textContent = "🖱 Now repeat the sequence!";
        state.startTime = Date.now();
        enableTileClicking();
    }, sequenceLength * 800 + 500);
}

function highlightTile(tile) {
    tile.classList.add("active");
    setTimeout(() => tile.classList.remove("active"), 600); // Stay highlighted for 600ms
}

function enableTileClicking() {
    const tiles = document.querySelectorAll(".sequence-tile");
    tiles.forEach(tile => {
        tile.addEventListener("click", handleTileClick);
    });
}

function handleTileClick(event) {
    const tileIndex = parseInt(event.target.dataset.index);
    state.currentSequence.push(tileIndex);

    console.log(`👆 User clicked: Tile ${tileIndex}`);

    if (tileIndex === state.expectedSequence[state.currentSequence.length - 1]) {
        event.target.classList.add("correct");
        setTimeout(() => event.target.classList.remove("correct"), 500);
    } else {
        event.target.classList.add("incorrect");
        setTimeout(() => event.target.classList.remove("incorrect"), 500);

        endRound(false);
        return;
    }

    if (state.currentSequence.length === state.expectedSequence.length) {
        endRound(true);
    }
}

function endRound(success) {
    const feedbackElement = document.getElementById("sequence-feedback");
    const actionButton = document.getElementById("next-sequence-round");

    const reactionTime = Date.now() - state.startTime;
    const tiles = document.querySelectorAll(".sequence-tile");

    // Remove click listeners to prevent spam clicking
    tiles.forEach(tile => tile.removeEventListener("click", handleTileClick));

    if (success) {
        feedbackElement.textContent = `✅ Correct! Reaction time: ${reactionTime}ms`;
        console.log(`✔ Round ${state.currentRound} completed in ${reactionTime}ms`);

        state.results.push({
            type: "sequence",
            time: reactionTime,
            round: state.currentRound
        });

        if (state.currentRound < CONFIG.roundsPerTest) {
            state.currentRound++;
            actionButton.textContent = "Next Round ➡";
            actionButton.onclick = runSequenceRound;
        } else {
            actionButton.textContent = "Continue to Results 📊";
            actionButton.onclick = showResultsScreen;
        }
    } else {
        feedbackElement.textContent = "❌ Incorrect! Try again...";
        console.log(`❌ Round ${state.currentRound} failed.`);

        if (state.currentRound < CONFIG.roundsPerTest) {
            state.currentRound++;
            actionButton.textContent = "Try Again 🔄";
            actionButton.onclick = runSequenceRound;
        } else {
            actionButton.textContent = "Continue to Results 📊";
            actionButton.onclick = showResultsScreen;
        }
    }

    actionButton.classList.remove("hidden");
}

function calculateScore() {
    const baseScore = state.results.reduce((sum, result) => sum + result.time, 0) / state.results.length;
    const accuracyScore = state.consecutiveCorrect / (state.results.length * CONFIG.roundsPerTest);
    return baseScore * (1 + (1 - accuracyScore));
}

// Results Analysis
function analyzeResults() {
    const scores = {
        visual: [],
        auditory: [],
        sequence: [],
    };

    state.results.forEach(result => {
        scores[result.type].push(result.time);
    });

    // Compute average reaction times for each test
    let averageScores = Object.entries(scores).map(([type, times]) => ({
        type,
        average: times.length ? (times.reduce((a, b) => a + b) / times.length) : 0
    }));

    // Adjust risk based on age
    let adjustedRisk = calculateAdjustedRisk(averageScores);

    return {
        averageScores,
        riskLevel: adjustedRisk.level,
        recommendations: adjustedRisk.recommendations
    };
}

function calculateAdjustedRisk(averageScores) {
    const age = state.patientAge || 70; // Default to 70 if no age is set
    let totalReactionTime = averageScores.reduce((sum, test) => sum + test.average, 0) / 1000; // Convert to seconds

    // Adjust thresholds based on age group
    let riskThresholds = getRiskThresholdsForAge(age);

    let riskLevel = "Low Risk";
    let recommendations = [];

    if (totalReactionTime > riskThresholds.high) {
        riskLevel = "High Risk";
        recommendations = [
            "Your reaction time is significantly slower than expected.",
            "Consider brain training exercises like puzzles or reflex-based games.",
            "Regular physical activity can help improve cognitive function."
        ];
    } else if (totalReactionTime > riskThresholds.medium) {
        riskLevel = "Moderate Risk";
        recommendations = [
            "Your reaction time is slightly below optimal.",
            "Try reaction-based video games or coordination exercises.",
            "Engage in activities that require fast thinking, like table tennis."
        ];
    } else {
        riskLevel = "Low Risk";
        recommendations = [
            "Your reaction time is excellent! Keep up the good work.",
            "Maintain cognitive health with challenging puzzles and memory exercises.",
            "Regular movement and reaction-based activities can help you stay sharp."
        ];
    }

    return { level: riskLevel, recommendations };
}

function getRiskThresholdsForAge(age) {
    if (age >= 80) {
        return { low: 5.0, medium: 6.5, high: 7.5 };  // Slower times for older users
    } else if (age >= 75) {
        return { low: 4.5, medium: 6.0, high: 7.0 };
    } else if (age >= 70) {
        return { low: 4.0, medium: 5.5, high: 6.5 };
    } else if (age >= 65) {
        return { low: 3.5, medium: 5.0, high: 6.0 };
    } else {
        return { low: 3.0, medium: 4.5, high: 5.5 };  // Faster expected times for younger users
    }
}

// Display the final results screen
function showResultsScreen() {
    console.log("🎯 Showing Results Screen...");
    showScreen("results-screen");

    state.stage = 3; // Ensure we are on the final stage
    updateProgressBar(state.stage); // Make sure the progress bar updates correctly

    // Get the analysis results
    const results = analyzeResults();

    // Update risk level
    const riskElement = document.getElementById("risk-level");
    riskElement.textContent = `🛑 Risk Level: ${results.riskLevel}`;

    // Update test breakdown
    const breakdownElement = document.getElementById("results-breakdown");
    breakdownElement.innerHTML = "";

    results.averageScores.forEach(test => {
        const avgTime = (test.average / 1000).toFixed(2); // Convert to seconds

        const resultItem = document.createElement("div");
        resultItem.classList.add("result-item");
        resultItem.innerHTML = `<strong>${test.type.charAt(0).toUpperCase() + test.type.slice(1)}:</strong> ${avgTime}s`;
        breakdownElement.appendChild(resultItem);
    });

    // Update recommendations
    const recommendationsElement = document.getElementById("recommendations");
    recommendationsElement.innerHTML = "";

    results.recommendations.forEach(tip => {
        const tipItem = document.createElement("p");
        tipItem.textContent = `✅ ${tip}`;
        recommendationsElement.appendChild(tipItem);
    });

    // Generate Score Gauge
    updateScoreGauge(results.averageScores);
}

function updateScoreGauge(averageScores) {
    const gaugeElement = document.getElementById("score-gauge");
    gaugeElement.innerHTML = ""; // Clear previous gauge

    let totalReactionTime = averageScores.reduce((sum, test) => sum + test.average, 0) / 1000; // Convert ms to s

    let gaugeColor;
    if (totalReactionTime < 4.0) {
        gaugeColor = "green";
    } else if (totalReactionTime < 5.5) {
        gaugeColor = "orange";
    } else {
        gaugeColor = "red";
    }

    // Set the width (max at 100%) based on reaction time (max 8s for scaling)
    const fillWidth = Math.min(100, (totalReactionTime / 8) * 100);

    gaugeElement.innerHTML = `
        <div class="gauge-fill" style="width: ${fillWidth}%; background-color: ${gaugeColor};">
            ${totalReactionTime.toFixed(2)}s
        </div>
    `;
}

function downloadResultsReport() {
    let reportText = `Assessment Results\n\n`;
    reportText += `Total Reaction Time: ${state.results.reduce((sum, res) => sum + res.time, 0) / 1000}s\n`;
    reportText += `Risk Level: ${document.getElementById("risk-level").textContent}\n\n`;

    reportText += "Test Breakdown:\n";
    state.results.forEach(result => {
        reportText += `${result.type.charAt(0).toUpperCase() + result.type.slice(1)}: ${result.time / 1000}s\n`;
    });

    reportText += "\nRecommendations:\n";
    document.querySelectorAll("#recommendations p").forEach(tip => {
        reportText += `- ${tip.textContent}\n`;
    });

    const blob = new Blob([reportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reaction_assessment_results.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("start-assessment");

    if (startButton) {
        startButton.addEventListener("click", function () {
            console.log("Assessment Started");
            showScreen("visual-test");
            startVisualTest();
        });
    } else {
        console.error("Start Assessment button not found!");
    }
});