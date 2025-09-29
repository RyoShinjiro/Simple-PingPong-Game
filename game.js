const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Responsive resize for canvas (for mobile)
function resizeCanvas() {
    let width = Math.min(window.innerWidth * 0.99, 700);
    let height = width * 400 / 700;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const WIDTH = 700;
const HEIGHT = 400;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 16;

const PADDLE_MARGIN = 15;
const PLAYER_X = PADDLE_MARGIN;
const AI_X = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

// Score variables
let playerScore = 0;
let aiScore = 0;

// Game variables
let playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
let aiY = (HEIGHT - PADDLE_HEIGHT) / 2;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);

// Draw functions
function drawRect(x, y, w, h, color = "#fff") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color = "#fff") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}
function drawNet() {
    ctx.strokeStyle = '#fff5';
    ctx.lineWidth = 4;
    for (let i = 0; i < HEIGHT; i += 28) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, i);
        ctx.lineTo(WIDTH / 2, i + 16);
        ctx.stroke();
    }
}
function drawScore() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(playerScore, WIDTH / 2 - 50, 50);
    ctx.fillText(aiScore, WIDTH / 2 + 50, 50);
}
function draw() {
    drawRect(0, 0, WIDTH, HEIGHT, "#111");
    drawNet();
    drawScore();
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    drawCircle(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2);
}

function update() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 0) {
        ballY = 0;
        ballSpeedY = -ballSpeedY;
    }
    if (ballY + BALL_SIZE >= HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballSpeedY = -ballSpeedY;
    }

    // Player paddle collision
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        ballSpeedY = collidePoint * 5;
    }
    // AI paddle collision
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_SIZE;
        ballSpeedX = -ballSpeedX;
        let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        ballSpeedY = collidePoint * 5;
    }

    // Ball out of left or right bounds (reset & add score)
    if (ballX < 0) {
        aiScore++;
        resetBall();
    }
    if (ballX > WIDTH) {
        playerScore++;
        // Submit score ke backend leaderboard
        if (playerScore === 1) { // hanya submit saat pertama cetak skor
            let username = prompt("Masukkan username Anda:");
            if (username) {
                submitScore(username, playerScore);
            }
        }
        resetBall();
    }

    // AI paddle movement (basic)
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY + BALL_SIZE / 2 - 12) {
        aiY += 4.5;
    } else if (aiCenter > ballY + BALL_SIZE / 2 + 12) {
        aiY -= 4.5;
    }
    aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));
}

function resetBall() {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    let angle = (Math.random() * 0.5 - 0.25) * Math.PI;
    let speed = 6;
    let dir = (Math.random() > 0.5) ? 1 : -1;
    ballSpeedX = Math.cos(angle) * speed * dir;
    ballSpeedY = Math.sin(angle) * speed;
}

// Mouse control for player paddle (desktop)
canvas.addEventListener('mousemove', function (evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    let scale = HEIGHT / canvas.getBoundingClientRect().height;
    playerY = mouseY * scale - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
});

// Touch control for player paddle (mobile)
let touchActive = false;
canvas.addEventListener('touchstart', function (evt) {
    touchActive = true;
    handleTouch(evt);
}, { passive: false });
canvas.addEventListener('touchmove', function (evt) {
    if (touchActive) handleTouch(evt);
    evt.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', function (evt) {
    touchActive = false;
}, { passive: false });

function handleTouch(evt) {
    if (evt.touches.length > 0) {
        let rect = canvas.getBoundingClientRect();
        let y = evt.touches[0].clientY - rect.top;
        let scale = HEIGHT / canvas.getBoundingClientRect().height;
        playerY = y * scale - PADDLE_HEIGHT / 2;
        playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
    }
}

// Backend leaderboard submission
function submitScore(username, score) {
    fetch('https://railway.com/project/c3fe89ab-d7bf-45b1-a9c1-eea53de52f91/service/f737e1db-050e-4c36-932c-319dbb4a32c2?environmentId=7bdc8caf-b4f4-4c71-93dd-85996f043a93', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Skor kamu berhasil disimpan!');
            loadLeaderboard();
        } else {
            alert('Gagal menyimpan skor!');
        }
    })
    .catch(err => alert('Error: ' + err));
}

// Tampilkan leaderboard
function loadLeaderboard() {
    fetch('https://railway.com/project/c3fe89ab-d7bf-45b1-a9c1-eea53de52f91/service/f737e1db-050e-4c36-932c-319dbb4a32c2?environmentId=7bdc8caf-b4f4-4c71-93dd-85996f043a93')
        .then(res => res.json())
        .then(data => {
            let html = '<h3>Leaderboard</h3><ol>';
            data.forEach(entry => html += `<li>${entry.username}: ${entry.score}</li>`);
            html += '</ol>';
            document.getElementById('leaderboard').innerHTML = html;
        });
}
loadLeaderboard();

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();


