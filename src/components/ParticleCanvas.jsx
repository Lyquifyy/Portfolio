import React, { useRef, useEffect } from "react";

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.3) * 0.3;
        this.speedY = (Math.random() - 0.3) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.2;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,165,60,${this.opacity})`;
        ctx.fill();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
    }

    const particlesArray = Array.from({ length: 50 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesArray.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    // Resize canvas on window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    if (!ctx) {
      console.error("Canvas context not available");
      return;
    }
    console.log(particlesArray[0]); // Inspect one particle's position


    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        width: "100%",
        height: "100%"      
      }}
    />
  );
};

export default ParticleCanvas;
