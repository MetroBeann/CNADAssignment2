// Initialize camera when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize camera for the default active assessment (chair)
    initializeCamera('chair');
  });
  
  // Handle "Start Reaction Assessment" button click
  document.addEventListener("DOMContentLoaded", function () {
      const startButton = document.getElementById("start-reaction-test");
  
      if (startButton) {
          startButton.addEventListener("click", function () {
              // Redirect to reaction.html
              window.location.href = "reaction.html";
          });
      }
  });

  // Handle "Start Gait Analysis" button click
document.addEventListener("DOMContentLoaded", function () {
    const startGaitButton = document.getElementById("start-gait-test");

    if (startGaitButton) {
        startGaitButton.addEventListener("click", function () {
            // Redirect to gait.html
            window.location.href = "gait.html";
        });
    }
});

// Handle "Start Clinical Frailty Scale Assessment" button click
document.addEventListener("DOMContentLoaded", function () {
    const startCfsButton = document.getElementById("start-cfs-test");

    if (startCfsButton) {
        startCfsButton.addEventListener("click", function () {
            // Redirect to cfs.html
            window.location.href = "cfs.html";
        });
    }
});
  
  // Assessment type selection
  function selectAssessment(type) {
    // Hide all assessment contents
    document.querySelectorAll('.assessment-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.assessment-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected assessment
    const assessmentContent = document.getElementById(`${type}-assessment`);
    if (assessmentContent) {
        assessmentContent.classList.add('active');
        
        // Activate selected button
        event.target.classList.add('active');
        
        // For CFS, redirect to the dedicated CFS page
        if (type === 'cfs') {
            window.location.href = 'cfs.html';
        }
    }
}
  
  // Initialize camera and setup motion detection
  function initializeCamera(type) {
      const videoElement = document.getElementById(`${type}-video`);
      if (!videoElement) return;
  
      // Stop existing video streams
      if (videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => track.stop());
      }
  
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
          .then(stream => {
              videoElement.srcObject = stream;
              videoElement.play();
  
              videoElement.onloadeddata = () => {
                  console.log("🎥 Video stream loaded, starting motion detection...");
                  startMotionDetection(videoElement); // ✅ Only start when video is loaded
              };
          })
          .catch(error => {
              console.error("❌ Webcam error:", error);
              alert("Please enable camera access to use this assessment.");
          });
  }
  
  
  
  function compareFrames(frame1, frame2) {
      let diffCount = 0;
      let threshold = 50; // Adjust motion sensitivity
  
      for (let i = 0; i < frame1.data.length; i += 4) {
          let rDiff = Math.abs(frame1.data[i] - frame2.data[i]);      
          let gDiff = Math.abs(frame1.data[i + 1] - frame2.data[i + 1]); 
          let bDiff = Math.abs(frame1.data[i + 2] - frame2.data[i + 2]); 
  
          if ((rDiff + gDiff + bDiff) > threshold) {
              diffCount++;
          }
      }
      return diffCount > MOTION_THRESHOLD; // ✅ Correct sensitivity check
  }
  
  
  
  
  // Chair Stand Test
  // Global variables for chair test
  let chairTimer;
  let motionDetectionInterval;
  let standCount = 0;
  let previousFrame = null;
  let chairTestActive = false;
  
  // Initialize motion detection parameters
  const MOTION_CHECK_INTERVAL = 200; // Check every 200ms
  const MOTION_THRESHOLD = 50000; // Adjust this value based on testing
  const PIXEL_THRESHOLD = 30; // Threshold for pixel difference
  
  // Event listener for start/stop button
  document.getElementById('start-chair').addEventListener('click', function() {
      if (this.textContent === 'Start Chair Stand Test') {
          startChairTest();
      } else {
          stopChairTest();
      }
  });
  
  function startChairTest() {
      let timeLeft = 30;
      standCount = 0;
      chairTestActive = true;
      previousFrame = null;
  
      // Update UI
      document.getElementById('timer').style.display = 'block';
      document.getElementById('start-chair').textContent = 'Stop Test';
      document.getElementById('stand-count').textContent = `Stands: ${standCount}`;
      document.getElementById('chair-results').style.display = 'none';
  
      // Start motion detection
      const video = document.getElementById('chair-video');
      startMotionDetection(video);
  
      // Start timer
      chairTimer = setInterval(() => {
          timeLeft--;
          document.getElementById('timer').textContent = timeLeft;
  
          if (timeLeft <= 0) {
              stopChairTest();
          }
      }, 1000);
  }
  
  function stopChairTest() {
      console.log("🛑 Stopping Chair Stand Test...");
      clearInterval(chairTimer);
      clearInterval(motionDetectionInterval); // ✅ Stop motion detection
      chairTestActive = false;
      previousFrame = null; // ✅ Prevents stale frame issues
  
      // Update UI
      document.getElementById("timer").style.display = "none";
      document.getElementById("start-chair").textContent = "Start Chair Stand Test";
      document.getElementById("chair-results").style.display = "block";
  
      // Determine risk level and next steps
      let riskLevel = "";
      let nextSteps = "";
  
      if (standCount < 8) {
          riskLevel = '<span class="risk-high">High Risk</span>';
          nextSteps = `
              <ul>
                  <li>🔴 Consult a doctor for fall-risk management.</li>
                  <li>🦵 Consider physical therapy for strength improvement.</li>
                  <li>🏠 Ensure a safe home environment (remove trip hazards).</li>
                  <li>🩺 Monitor balance issues closely and track progress.</li>
              </ul>
          `;
      } else if (standCount < 12) {
          riskLevel = '<span class="risk-moderate">Moderate Risk</span>';
          nextSteps = `
              <ul>
                  <li>🟠 Increase lower-body strength exercises.</li>
                  <li>🚶 Stay active with daily walks or chair exercises.</li>
                  <li>🩹 Check medication side effects** that may impact balance.</li>
                  <li>📆 Follow-up assessments recommended in 3 months.</li>
              </ul>
          `;
      } else {
          riskLevel = '<span class="risk-low">Low Risk</span>';
          nextSteps = `
              <ul>
                  <li>🟢 Maintain an active lifestyle.</li>
                  <li>🧘 Include balance & flexibility training.</li>
                  <li>🥗 Follow a healthy diet for muscle health.</li>
                  <li>📅 Annual check-ups recommended.</li>
              </ul>
          `;
      }
  
      // Display results
      document.getElementById("risk-level").innerHTML = `Risk Level: ${riskLevel}`;
      document.getElementById("next-steps").innerHTML = `
          <h4>Next Steps:</h4> ${nextSteps}
      `;
  }
  
  function startMotionDetection(video) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
      // Ensure video has valid width and height
      video.addEventListener("loadedmetadata", () => {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
      });
  
      motionDetectionInterval = setInterval(() => {
          if (!chairTestActive) return;
  
          // 🚀 **Fix: Ensure the video is playing before drawing**
          if (video.readyState < 2) { 
              console.warn("⏳ Video not ready yet... Skipping frame");
              return;
          }
  
          try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
              if (previousFrame) {
                  const motionDetected = detectMotion(previousFrame, currentFrame);
                  if (motionDetected) {
                      standCount++;
                      document.getElementById('stand-count').textContent = `Stands: ${standCount}`;
                      console.log(`✅ Stand detected: ${standCount}`);
                      
                      // Prevent double-counting
                      chairTestActive = false;
                      setTimeout(() => { chairTestActive = true; }, 1000);
                  }
              }
              previousFrame = currentFrame;
          } catch (error) {
              console.error("❌ drawImage() error:", error);
          }
      }, MOTION_CHECK_INTERVAL);
  }
  
  function detectMotion(prev, curr) {
      let motionPixels = 0;
  
      for (let i = 0; i < prev.data.length; i += 4) {
          const rDiff = Math.abs(prev.data[i] - curr.data[i]);
          const gDiff = Math.abs(prev.data[i + 1] - curr.data[i + 1]);
          const bDiff = Math.abs(prev.data[i + 2] - curr.data[i + 2]);
  
          if (rDiff > PIXEL_THRESHOLD || gDiff > PIXEL_THRESHOLD || bDiff > PIXEL_THRESHOLD) {
              motionPixels++;
          }
      }
  
      return motionPixels > 8000; // ✅ Lower threshold for better detection
  }
  
  
  // Clinical Frailty Scale
  const cfsData = [
      { score: 1, title: "Very Fit", description: "People who are robust, active, energetic and motivated." },
      { score: 2, title: "Well", description: "People who have no active disease symptoms but are less fit than category 1." },
      { score: 3, title: "Managing Well", description: "People whose medical problems are well controlled." },
      { score: 4, title: "Vulnerable", description: "While not dependent on others for daily help, symptoms often limit activities." },
      { score: 5, title: "Mildly Frail", description: "These people often have more evident slowing, and need help with high order daily activities." },
      { score: 6, title: "Moderately Frail", description: "People who need help with all outside activities and with keeping house." },
      { score: 7, title: "Severely Frail", description: "Completely dependent for personal care, from whatever cause." },
      { score: 8, title: "Very Severely Frail", description: "Completely dependent and approaching the end of life." },
      { score: 9, title: "Terminally Ill", description: "Approaching the end of life." }
  ];
    
  let currentCFSIndex = 0;
    
  function initializeCFS() {
      updateCFSContent();
  }
    
  function updateCFSContent() {
      const currentScale = cfsData[currentCFSIndex];
      const content = `
          <div class="scale-item">
              <h4>${currentScale.score}. ${currentScale.title}</h4>
              <p>${currentScale.description}</p>
          </div>
      `;
      document.getElementById('cfs-content').innerHTML = content;
  }
    
  function previousScale() {
      if (currentCFSIndex > 0) {
          currentCFSIndex--;
          updateCFSContent();
      }
  }
    
  function nextScale() {
      if (currentCFSIndex < cfsData.length - 1) {
          currentCFSIndex++;
          updateCFSContent();
      }
  }
    
  function selectScale() {
      const score = cfsData[currentCFSIndex].score;
      let riskLevel = '';
      
      if (score <= 3) {
          riskLevel = '<span class="risk-low">Low Risk</span>';
      } else if (score <= 5) {
          riskLevel = '<span class="risk-moderate">Moderate Risk</span>';
      } else {
          riskLevel = '<span class="risk-high">High Risk</span>';
      }
      
      document.getElementById('cfs-content').innerHTML += `
          <div class="assessment-result">
              <h3>Assessment Result</h3>
              <p>Clinical Frailty Scale Score: ${score}</p>
              <p>Risk Level: ${riskLevel}</p>
          </div>
      `;
  }
  
  // Gait Analysis
  let gaitTimer;
  let gaitStartTime;
  
  document.getElementById('start-gait').addEventListener('click', function() {
    if (this.textContent === 'Start Gait Analysis') {
        startGaitTest();
    } else {
        stopGaitTest();
    }
  });
  
  function startGaitTest() {
    document.getElementById('gait-timer').style.display = 'block';
    document.getElementById('start-gait').textContent = 'Stop Test';
    gaitStartTime = Date.now();
    
    gaitTimer = setInterval(() => {
        const elapsed = (Date.now() - gaitStartTime) / 1000;
        document.getElementById('gait-timer').textContent = elapsed.toFixed(1) + 's';
    }, 100);
  }
  
  function stopGaitTest() {
    clearInterval(gaitTimer);
    const timeInSeconds = (Date.now() - gaitStartTime) / 1000;
    document.getElementById('gait-timer').style.display = 'none';
    document.getElementById('start-gait').textContent = 'Start Gait Analysis';
    
    // Show results
    document.getElementById('gait-results').style.display = 'block';
    document.getElementById('completion-time').textContent = `Completion Time: ${timeInSeconds.toFixed(1)}s`;
    
    // Determine risk level
    let riskLevel = '';
    if (timeInSeconds > 12) {
        riskLevel = '<span class="risk-high">High Risk</span>';
    } else if (timeInSeconds > 10) {
        riskLevel = '<span class="risk-moderate">Moderate Risk</span>';
    } else {
        riskLevel = '<span class="risk-low">Low Risk</span>';
    }
    document.getElementById('gait-risk-level').innerHTML = `Risk Level: ${riskLevel}`;
  }
  
  // Event listener for manual counting with spacebar
  document.addEventListener('keydown', function(event) {
      if (event.code === 'Space' && chairTestActive) {
          standCount++;
          document.getElementById('stand-count').textContent = `Stands: ${standCount}`;
      }
  });
  
  // Function to start the vision test
  function startVisionTest() {
      // Prompt the user to enter the smallest line number they can read (1-11)
      let selectedLine = prompt("Enter the smallest line number you can read (1-11):");
  
      // Validate the input
      if (!selectedLine || selectedLine < 1 || selectedLine > 11) {
          alert("Please enter a valid number between 1 and 11.");
          return;
      }
  
      // Determine the fall-risk score based on the selected line
      let score;
      switch (parseInt(selectedLine)) {
          case 1:
              score = "20/400 (High Risk of Fall)"; // Severe vision impairment
              break;
          case 2:
              score = "20/200 (High Risk of Fall)";
              break;
          case 3:
              score = "20/100 (Moderate Risk of Fall)";
              break;
          case 4:
              score = "20/80 (Moderate Risk of Fall)";
              break;
          case 5:
              score = "20/70 (Moderate Risk of Fall)";
              break;
          case 6:
              score = "20/60 (Mild Risk of Fall)";
              break;
          case 7:
              score = "20/50 (Mild Risk of Fall)";
              break;
          case 8:
              score = "20/40 (Normal Vision, Low Risk of Fall)";
              break;
          case 9:
              score = "20/30 (Normal Vision, Low Risk of Fall)";
              break;
          case 10:
              score = "20/25 (Normal Vision, Very Low Risk of Fall)";
              break;
          case 11:
              score = "20/20 (Perfect Vision, Very Low Risk of Fall)";
              break;
      }
  
      // Display the fall risk score and show the results
      document.getElementById("vision-score").innerText = "Your vision score: " + score;
      document.getElementById("vision-results").style.display = "block";
  }
  
  // Modify function to show the correct assessment
  function selectAssessment(type) {
      // Hide all assessments
      let assessments = document.querySelectorAll(".assessment-content");
      assessments.forEach(a => a.classList.remove("active"));
  
      // Show the selected assessment
      document.getElementById(type + "-assessment").classList.add("active");
  }
  
  
  
  // Modify function to show the correct assessment
  function selectAssessment(type) {
      let assessmentContent = document.getElementById(`${type}-assessment`);
      
      if (!assessmentContent) {
          console.error(`❌ Error: Element with ID '${type}-assessment' not found.`);
          return; // Stop execution if the element does not exist
      }
  
      // Hide all assessment contents
      document.querySelectorAll('.assessment-content').forEach(content => {
          content.classList.remove('active');
      });
  
      // Remove active class from all buttons
      document.querySelectorAll('.assessment-button').forEach(button => {
          button.classList.remove('active');
      });
  
      // Show selected assessment
      assessmentContent.classList.add('active');
  
      // Activate selected button
      event.target.classList.add('active');
  
      // Initialize specific assessment
      if (type === 'chair' || type === 'gait') {
          initializeCamera(type);
      } else if (type === 'cfs') {
          initializeCFS();
      }
  }