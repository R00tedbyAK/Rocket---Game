# 🚀 Rocket Movement Simulation (Canvas + Antigravity Basics)

A simple **HTML5 Canvas-based rocket simulation** where a rocket can be controlled using the keyboard (WASD).  
The rocket smoothly rotates in the direction of movement and emits smoke particles while moving, creating a basic antigravity / space-like effect.

This project is beginner-friendly and focuses on **movement, rotation, particles, and animation loops**.

---

## 🎮 Features

- Keyboard-controlled rocket movement (W, A, S, D)
- Smooth rocket rotation based on direction
- Smoke particle effect while the rocket is moving
- Static glowing moon for visual depth
- Full-screen responsive canvas
- Clean animation loop using `requestAnimationFrame`

---

## 🧠 How It Works (Simple Explanation)

Think of the rocket like a character in a game:

- The **canvas** is the screen
- The **rocket object** stores position, speed, and angle
- Every frame:
  1. The rocket position updates based on key presses
  2. The rocket angle smoothly rotates toward the movement direction
  3. Smoke particles are created when the rocket moves
  4. Old particles fade out and are removed
  5. Everything is redrawn on the canvas

🧩 *Analogy:*  
Like driving a remote-control rocket — when you press a key, it moves, turns smoothly, and leaves smoke behind.

---

## ⌨️ Controls

| Key | Action |
|----|-------|
| W | Move Up |
| A | Move Left |
| S | Move Down |
| D | Move Right |

Diagonal movement is supported (e.g., **W + D**).

---

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Canvas 2D API

No external libraries are used.

---

## 📁 Project Structure
/project-folder
│
├── index.html # Main HTML file
├── style.css # Canvas and page styling
└── script.js # Rocket logic, particles, and animation

