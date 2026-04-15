const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rocket = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 60,
    speed: 5,
    angle: 0
};

let bullets = [];
let totalScore = 0;
let levelScore = 0;
let currentLevel = 1;
const levelData = {
    1: { time: 10, target: 5 },
    2: { time: 15, target: 8 },
    3: { time: 25, target: 15 }
};
let timeLeft = levelData[currentLevel].time;
let gameOver = false;
let gameCompleted = false;
const timerDisplay = document.getElementById('timer');

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 10;
        this.radius = 3;
        // Direction vector based on rocket rotation (UP is 0)
        this.vx = Math.sin(angle) * this.speed;
        this.vy = -Math.cos(angle) * this.speed;
        this.life = 100; // Frames before it disappears
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = '#f1c40f'; // Yellow glowing bullet
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

class Alien {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 15 + 10;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.bobAngle = Math.random() * Math.PI * 2;
        this.bobSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.bobAngle += this.bobSpeed;

        const hRadius = this.size * 1.5;
        const vRadius = this.size * 0.5 + 5; // Added 5 for bobbing amplitude

        if (this.x - hRadius < 0 || this.x + hRadius > canvas.width) {
            this.speedX *= -1;
        }
        if (this.y - vRadius < 0 || this.y + vRadius > canvas.height) {
            this.speedY *= -1;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y + Math.sin(this.bobAngle) * 5);

        // UFO body
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.5, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // UFO dome
        ctx.fillStyle = 'rgba(116, 235, 213, 0.7)';
        ctx.beginPath();
        ctx.arc(0, -this.size * 0.3, this.size * 0.7, Math.PI, 0);
        ctx.fill();

        // Alien head
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(0, -this.size * 0.3, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Alien eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-this.size * 0.15, -this.size * 0.4, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.size * 0.15, -this.size * 0.4, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // UFO lights
        const timeOffset = Date.now() / 200;
        ctx.fillStyle = (Math.floor(timeOffset + this.x) % 2 === 0) ? '#f1c40f' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(-this.size * 0.8, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = (Math.floor(timeOffset + this.x + 1) % 2 === 0) ? '#f1c40f' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.size * 0.8, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 15 + 10;
        // Random speed between 0.5 and 4.5 in any direction
        const baseSpeed = Math.random() * 4 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        this.speedX = Math.cos(angle) * baseSpeed;
        this.speedY = Math.sin(angle) * baseSpeed;
    }
}

const aliens = [];
for (let i = 0; i < 7; i++) {
    aliens.push(new Alien());
}

class Particle {
    constructor(x, y, color = 'rgba(255, 255, 255, 1)', speedMult = 1) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() * 2 - 1) * speedMult;
        this.speedY = (Math.random() * 2 - 1) * speedMult;
        this.color = color;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.95; // Shrink
        this.opacity -= 0.02;
    }

    draw() {
        ctx.fillStyle = this.color.replace('1)', `${this.opacity})`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color, 5));
    }
}

// Track key states
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Moon (Static Top-Middle)
    const moonColor = '#f5e050'; // Dim yellow

    ctx.beginPath();
    // Position: X = Center, Y = 80 (Top)
    ctx.arc(canvas.width / 2, 80, 50, 0, Math.PI * 2);
    ctx.fillStyle = moonColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = moonColor;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw Aliens
    aliens.forEach(a => a.draw());

    // Draw Particles first (behind rocket)
    particles.forEach(p => p.draw());

    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    ctx.rotate(rocket.angle || 0);

    // Draw Rocket Body (Same red color)
    ctx.fillStyle = '#ff4757';
    // Main body
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 30, 0, 0, Math.PI * 2); // Vertical ellipse
    ctx.fill();

    // Rocket Window
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#74ebd5'; // Light blue glass
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Fins
    ctx.fillStyle = '#d63031'; // Darker red
    // Left Fin
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(-25, 30);
    ctx.lineTo(-10, 25);
    ctx.fill();
    // Right Fin
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(25, 30);
    ctx.lineTo(10, 25);
    ctx.fill();
    // Center Fin
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, 35);
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 4;
    ctx.stroke();

    // --- DRAW ASTRONAUT ---
    ctx.save();
    // Move up to sit on top of the rocket body
    ctx.translate(0, -10);

    // Spacesuit body
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.roundRect(-8, -10, 16, 18, 5);
    ctx.fill();

    // Helmet
    ctx.beginPath();
    ctx.arc(0, -15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Visor
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.ellipse(0, -16, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gun
    ctx.fillStyle = '#2c3e50';
    // Gun body
    ctx.fillRect(5, -5, 12, 4);
    // Gun handle
    ctx.fillRect(5, -2, 3, 5);

    ctx.restore();
    // --- END ASTRONAUT ---

    ctx.restore();

    // Draw Bullets
    bullets.forEach(b => b.draw());

    // Draw Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowBlur = 0; // Reset any shadow from passing objects
    ctx.fillText(`Level: ${currentLevel}`, 20, 20);
    ctx.fillText(`Score: ${levelScore} / ${levelData[currentLevel].target}`, 20, 50);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.font = 'bold 64px Arial';

        if (gameCompleted) {
            ctx.fillStyle = '#f1c40f'; // Gold colour for win
            ctx.fillText('MISSION COMPLETE!', canvas.width / 2, canvas.height / 2 - 20);
        } else {
            ctx.fillStyle = '#e74c3c'; // Red colour for game over
            ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`Final Kills: ${totalScore}`, canvas.width / 2, canvas.height / 2 + 40);

        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to Restart', canvas.width / 2, canvas.height / 2 + 90);
    }
}

function update() {
    if (gameOver) return;
    let isMoving = false;

    // Movement
    if (keys.w) { rocket.y -= rocket.speed; isMoving = true; }
    if (keys.s) { rocket.y += rocket.speed; isMoving = true; }
    if (keys.a) { rocket.x -= rocket.speed; isMoving = true; }
    if (keys.d) { rocket.x += rocket.speed; isMoving = true; }

    // Boundaries
    if (rocket.x < 0) rocket.x = 0;
    if (rocket.x > canvas.width) rocket.x = canvas.width;
    if (rocket.y < 0) rocket.y = 0;
    if (rocket.y > canvas.height) rocket.y = canvas.height;

    // Generate Smoke
    if (isMoving) {
        for (let i = 0; i < 2; i++) {
            particles.push(new Particle(rocket.x, rocket.y, 'rgba(255, 255, 255, 1)', 1.5));
        }
    }

    // Rocket Rotation Logic
    let targetAngle = 0; // Default: Point Up

    if (keys.d) targetAngle = Math.PI / 2; // Right
    else if (keys.a) targetAngle = -Math.PI / 2; // Left
    else if (keys.s) targetAngle = Math.PI; // Down (Optional, but makes it consistent)

    // If we want diagonal movement to face diagonally:
    if (keys.w && keys.d) targetAngle = Math.PI / 4;
    else if (keys.w && keys.a) targetAngle = -Math.PI / 4;
    else if (keys.s && keys.d) targetAngle = 3 * Math.PI / 4;
    else if (keys.s && keys.a) targetAngle = -3 * Math.PI / 4;


    // Smoothly interpolate current angle to target angle
    rocket.angle = rocket.angle || 0;

    // Handle the wraparound case for smooth rotation (e.g. -PI to PI) if needed, 
    // but for simple WASD, linear lerp is mostly fine unless we go full circle rapidly.
    // For simple Left/Right/Up/Down, direct lerp works well enough.

    let diff = targetAngle - rocket.angle;
    // Normalize diff to -PI to +PI
    while (diff <= -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    rocket.angle += diff * 0.1;

    // Update Particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        // Remove dead particles
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    // Update Bullets
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update();
        if (bullets[i].life <= 0) {
            bullets.splice(i, 1);
            i--;
        }
    }

    // Update Aliens & Check Collisions
    aliens.forEach(a => {
        a.update();

        // Bullet-Alien Collision
        bullets.forEach((b, bIndex) => {
            const bDist = Math.hypot(b.x - a.x, b.y - a.y);
            if (bDist < a.size + 10) {
                triggerAlienDeath(a);
                bullets.splice(bIndex, 1);
            }
        });
    });
}

function triggerAlienDeath(alien) {
    createExplosion(alien.x, alien.y, 'rgba(46, 204, 113, 1)'); // Alien green explosion
    createExplosion(alien.x, alien.y, 'rgba(155, 89, 182, 1)'); // UFO purple explosion
    totalScore++;
    levelScore++;
    alien.reset();

    // Check level progression
    if (levelScore >= levelData[currentLevel].target) {
        if (currentLevel === 3) {
            gameCompleted = true; // Beat level 3!
            gameOver = true;
        } else {
            currentLevel++;
            levelScore = 0;
            timeLeft = levelData[currentLevel].time;
            timerDisplay.innerText = timeLeft;
            timerDisplay.classList.remove('warning');

            // Re-spawn aliens to make it fresh
            aliens.forEach(a => a.reset());
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    update();
    draw();
}

// Timer Logic
function startTimer() {
    const countdown = setInterval(() => {
        if (gameOver) {
            clearInterval(countdown);
            return;
        }

        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 3) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }

        if (timeLeft <= 0) {
            gameOver = true;
            clearInterval(countdown);
        }
    }, 1000);
}

function restartGame() {
    currentLevel = 1;
    totalScore = 0;
    levelScore = 0;
    timeLeft = levelData[currentLevel].time;
    gameOver = false;
    gameCompleted = false;
    bullets = [];
    particles = [];
    timerDisplay.innerText = timeLeft;
    timerDisplay.classList.remove('warning');
    rocket.x = canvas.width / 2;
    rocket.y = canvas.height / 2;
    rocket.angle = 0;
    aliens.forEach(a => a.reset());

    // Resume timer
    startTimer();
}

startTimer();

window.addEventListener('keydown', (e) => {
    if (gameOver && e.key === ' ') {
        restartGame();
        return;
    }
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
    if (e.key === ' ') {
        // Shoot!
        bullets.push(new Bullet(rocket.x, rocket.y, rocket.angle));
    }
});

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        bullets.push(new Bullet(rocket.x, rocket.y, rocket.angle));
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    rocket.x = canvas.width / 2;
    rocket.y = canvas.height / 2;
});

animate();
