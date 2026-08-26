import "./styles.css";

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const hero = document.querySelector(".hero");
if (hero && !prefersReduced) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    hero.style.setProperty("--mx", x.toFixed(3));
    hero.style.setProperty("--my", y.toFixed(3));
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--mx", "0");
    hero.style.setProperty("--my", "0");
  });
}

const stats = document.querySelector(".stats");
if (stats) {
  const numbers = [...stats.querySelectorAll("[data-count]")];

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      numbers.forEach(animateCount);
      observer.disconnect();
    },
    { threshold: 0.4 }
  );

  observer.observe(stats);
}

const processSection = document.querySelector(".process");
if (processSection) {
  if (prefersReduced) {
    processSection.classList.add("is-inview");
  } else {
    processSection.classList.add("process--pending");

    const reveal = () => {
      processSection.classList.add("is-inview");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        reveal();
        observer.disconnect();
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(processSection);
  }
}
