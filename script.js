const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rocket = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 60,
    speed: 5
};

let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2; // Random size 2-7
        this.speedX = Math.random() * 2 - 1; // Random horizontal spread
        this.speedY = Math.random() * 2 + 1; // Falls/moves down slightly
        this.color = 'rgba(255, 255, 255, 1)'; // White
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY; // Smoke tends to drift away relative to rocket
        this.size += 0.1; // Grow slightly
        if (this.size > 20) this.size = 20; // Cap size
        this.opacity -= 0.02; // Fade out
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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

    ctx.restore();
}

function update() {
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
        // Create multiple particles for density
        for (let i = 0; i < 2; i++) {
            // Adjust particle emission point based on rotation
            // We need to emit from the "bottom" of the rocket, which changes with rotation
            // Simple approximation: Emit from center, since we draw particles behind
            particles.push(new Particle(rocket.x, rocket.y));
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
}

function animate() {
    requestAnimationFrame(animate);
    update();
    draw();
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
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
