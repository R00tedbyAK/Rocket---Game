# 🚀 Rocket Game (Space Shooter)

## 🎮 Overview  
A fast-paced **2D space shooter game** built using **HTML5 Canvas and Vanilla JavaScript**. Control your rocket, eliminate aliens, and increase your score with smooth animations and dynamic effects.

---

## ✨ Features  
- 🚀 Smooth rocket movement with rotation  
- 👾 Animated UFO-style aliens  
- 🔫 Shooting system (keyboard + mouse)  
- 💥 Explosion particle effects  
- 🌫️ Rocket smoke trail  
- 🌙 Glowing moon background  
- 📈 Real-time score tracking  
- ⚡ Collision detection system  

---

## 🎯 Controls  

| Key | Action |
|-----|--------|
| **W** | Move Up |
| **A** | Move Left |
| **S** | Move Down |
| **D** | Move Right |
| **SPACE** | Shoot |
| **Left Click** | Shoot |

---

## 🛠️ Tech Stack  
- **JavaScript (Vanilla)**  
- **HTML5 Canvas API**  
- No external libraries used  

---

## 🧩 How It Works  

### 🔁 Game Loop  
The game runs using:
```js
requestAnimationFrame(animate)
```
- `update()` → Handles movement, physics, collisions  
- `draw()` → Renders everything on canvas  

---

### 🚀 Core Components  

#### Rocket  
- Controlled via WASD  
- Smooth angle rotation  
- Emits smoke particles while moving  

#### Bullets  
- Fired in direction of rocket  
- Uses trigonometry (`sin`, `cos`)  
- Limited lifetime for performance  

#### Aliens  
- Random movement with floating animation  
- Bounce within screen  
- Respawn after being destroyed  

#### Particles  
- Used for explosions & smoke  
- Fade and shrink over time  

---

### 💥 Collision Detection  
Uses distance-based collision:
```js
Math.hypot(x1 - x2, y1 - y2)
```

---

## 🚀 Getting Started  

### 1. Clone the Repository
```bash
git clone https://github.com/R00tedbyAK/Rocket---Game.git
```

### 2. Run the Game  
Open `index.html` in your browser.

---

## 📁 Project Structure  
```
Rocket---Game/
 ┣ index.html
 ┣ script.js
 ┗ README.md
```

---

## 🔥 Future Improvements  
- 🔊 Sound effects & background music  
- ❤️ Health system  
- 👾 Advanced enemy AI  
- 🏆 High score saving  
- 🌌 Better space environment  

---

## 👨‍💻 Author  
**R00tedbyAK (Root)**  
Cybersecurity Enthusiast | Developer  

---

## ⚡ Note  
This project is built using **pure JavaScript without any frameworks**, showcasing core game development concepts using the Canvas API.
