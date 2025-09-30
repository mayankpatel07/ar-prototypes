let puzzlesDB = {};

// Load puzzles.json
fetch('puzzles.json')
  .then(res => res.json())
  .then(data => puzzlesDB = data);

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const puzzleArea = document.getElementById('puzzleArea');
const chest = document.getElementById('chest');

// Start camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    requestAnimationFrame(scanQR);
  })
  .catch(err => {
    console.error("Camera error:", err);
    puzzleArea.innerHTML = "<p>Camera access denied or unavailable.</p>";
  });

function scanQR() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      loadPuzzle(code.data);
    }
  }
  requestAnimationFrame(scanQR);
}

function loadPuzzle(key) {
  const puzzle = puzzlesDB[key];
  if (!puzzle) {
    puzzleArea.innerHTML = "<p>Unknown QR code.</p>";
    return;
  }

  // Clear puzzle area
  puzzleArea.innerHTML = "";

  // Show question
  const questionP = document.createElement('p');
  questionP.textContent = puzzle.question;
  puzzleArea.appendChild(questionP);

  // Input field
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'answerInput';
  input.placeholder = "Type answer";
  puzzleArea.appendChild(input);

  // Feedback element
  const feedback = document.createElement('p');
  feedback.id = 'feedbackText';
  puzzleArea.appendChild(feedback);

  // Submit button
  const btn = document.createElement('button');
  btn.textContent = "Submit";
  btn.onclick = () => checkAnswer(key);
  puzzleArea.appendChild(btn);
}

function checkAnswer(key) {
  const input = document.getElementById('answerInput').value.trim();
  const feedback = document.getElementById('feedbackText');

  if (input.toLowerCase() === puzzlesDB[key].answer.toLowerCase()) {
    feedback.textContent = "Correct! Opening chest...";
    chest.setAttribute("visible", "true");
  } else {
    feedback.textContent = "Wrong answer, try again!";
  }
}

// Helper for testing without QR
window.__simulateQR = function(key) {
  loadPuzzle(key);
};
