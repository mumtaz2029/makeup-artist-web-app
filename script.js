const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(
  '.nav-links a[href^="#"], .brand[href^="#"], .button-secondary[href^="#"], .scroll-indicator'
);
const toast = document.getElementById("toast");
const form = document.querySelector(".contact-form");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

function updateHeaderState() {
  if (window.scrollY > 30) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState);

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const siblings = [...entry.target.parentElement.children].filter((child) =>
        child.classList.contains("reveal")
      );
      const index = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.max(index, 0) * 120}ms`;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const counters = document.querySelectorAll(".counter");
const easeOutQuad = (t) => t * (2 - t);

function animateCounter(counter) {
  const target = Number(counter.dataset.target || 0);
  const suffix = counter.dataset.suffix || "";
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutQuad(progress);
    const current = Math.round(target * eased);
    counter.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

counters.forEach((counter) => counterObserver.observe(counter));

function applyTiltEffect(element, rotationLimit = 14) {
  if (prefersReducedMotion || isTouchDevice) {
    return;
  }

  element.addEventListener("mousemove", (event) => {
    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const rotateY = ((offsetX - rect.width / 2) / (rect.width / 2)) * rotationLimit;
    const rotateX = ((rect.height / 2 - offsetY) / (rect.height / 2)) * rotationLimit;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });
}

document.querySelectorAll("[data-tilt]").forEach((element) => applyTiltEffect(element));

const canvas = document.getElementById("hero-particles");

if (canvas) {
  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = isTouchDevice ? 42 : 80;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5
      });
    }
  }

  function wrapParticle(particle) {
    if (particle.x < 0) particle.x = canvas.width;
    if (particle.x > canvas.width) particle.x = 0;
    if (particle.y < 0) particle.y = canvas.height;
    if (particle.y > canvas.height) particle.y = 0;
  }

  function drawParticles() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      wrapParticle(particle);

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = "#D4AF37";
      context.globalAlpha = 0.75;
      context.fill();
    });

    context.globalAlpha = 1;
    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();

  if (!prefersReducedMotion) {
    drawParticles();
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    createParticles();
  });
}

if (form && toast) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const body = new URLSearchParams(formData).toString();

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    })
      .then(() => {
        form.reset();
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 3200);
      })
      .catch(() => {
        toast.textContent = "Something went wrong. Please try again or message on WhatsApp.";
        toast.classList.add("show");
        window.setTimeout(() => {
          toast.classList.remove("show");
          toast.textContent = "Thank you! Sania will reach out soon.";
        }, 3200);
      });
  });
}
