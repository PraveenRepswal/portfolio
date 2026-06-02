const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const particles = [];
let mouse = { x: -9999, y: -9999, radius: 150 };

// Particle configuration
const particleDensity = 9000; // Pixels per particle
const maxDistance = 100;      // Distance to draw connections
const baseSpeed = 0.4;        // Particle movement speed

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * baseSpeed;
    this.vy = (Math.random() - 0.5) * baseSpeed;
    this.radius = Math.random() * 1.5 + 0.8; // Tiny particles: 0.8px to 2.3px
    this.baseAlpha = Math.random() * 0.3 + 0.2; // 0.2 to 0.5 opacity
    this.alpha = this.baseAlpha;
    this.color = { r: 255, g: 255, b: 255 }; // White base
  }

  update() {
    // Normal drift
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around screen edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Mouse Interaction: Repulsion and Color Shifting
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouse.radius) {
      // Gently push away from mouse
      const force = (mouse.radius - dist) / mouse.radius;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * force * 1.5;
      this.y += Math.sin(angle) * force * 1.5;

      // Glow turquoise near mouse
      this.color = { r: 0, g: 255, b: 204 }; // #00ffcc
      this.alpha = this.baseAlpha + (1 - this.baseAlpha) * force * 0.8;
    } else {
      // Return to base color & alpha
      this.color.r += (255 - this.color.r) * 0.05;
      this.color.g += (255 - this.color.g) * 0.05;
      this.color.b += (255 - this.color.b) * 0.05;
      this.alpha += (this.baseAlpha - this.alpha) * 0.05;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, ${this.alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  particles.length = 0;
  const numParticles = Math.floor((width * height) / particleDensity);
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
}

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
});

window.addEventListener("touchend", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

function drawScene() {
  ctx.clearRect(0, 0, width, height);

  // Update and draw particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  // Draw delicate connection lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];

      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        // Line transparency based on distance
        const alpha = (1 - dist / maxDistance) * 0.12;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        // If one of the particles is glowing turquoise, color the line turquoise
        if (p1.color.r < 200 || p2.color.r < 200) {
          ctx.strokeStyle = `rgba(0, 255, 204, ${alpha * 1.5})`;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        }
        
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawScene);
}

initParticles();
drawScene();
