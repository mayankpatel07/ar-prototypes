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
  puzzleArea.innerHTML = `
    <p>${puzzle.question}</p>
    <input type="text" id="answerInput" placeholder="Type answer">
    <button onclick="checkAnswer('${key}')">Submit</button>
  `;
}

function checkAnswer(key) {
  const input = document.getElementById('answerInput').value.trim();
  if (input.toLowerCase() === puzzlesDB[key].answer.toLowerCase()) {
    puzzleArea.innerHTML = "<p>Correct! Opening chest...</p>";
    chest.setAttribute("visible", "true");
  } else {
    puzzleArea.innerHTML += "<p style='color:red;'>Wrong answer, try again!</p>";
  }
}

// Helper for testing without QR
window.__simulateQR = function(key) {
  loadPuzzle(key);
};
