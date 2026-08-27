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

const skillsSection = document.querySelector(".skills");
if (skillsSection) {
  skillsSection.classList.add("is-inview");

  if (!prefersReduced) {
    skillsSection.addEventListener("pointermove", (event) => {
      const bounds = skillsSection.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      skillsSection.style.setProperty("--mx", x.toFixed(3));
      skillsSection.style.setProperty("--my", y.toFixed(3));
    });

    skillsSection.addEventListener("pointerleave", () => {
      skillsSection.style.setProperty("--mx", "0");
      skillsSection.style.setProperty("--my", "0");
    });
  }
}

const processSection = document.querySelector(".process");
if (processSection) {
  processSection.classList.add("is-inview");
}

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const stage = carousel.querySelector(".works__stage");
  const slides = [...carousel.querySelectorAll(".work-card")];
  const dotsWrap = carousel.querySelector(".works__dots");
  const prevBtn = document.querySelector("[data-works-prev]");
  const nextBtn = document.querySelector("[data-works-next]");
  const count = slides.length;
  let index = 0;
  let timer = 0;
  let dragging = false;
  let startX = 0;
  let delta = 0;
  let dragged = false;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "works__dot";
    dot.setAttribute("aria-label", `Go to project ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.append(dot);
  });
  const dots = [...dotsWrap.querySelectorAll(".works__dot")];

  const shortestOffset = (i) => {
    let d = i - index;
    const half = Math.ceil(count / 2);
    if (d > half) d -= count;
    if (d < -half) d += count;
    return d;
  };

  const layout = () => {
    const span = Math.min(stage.clientWidth * 0.26, 240);
    slides.forEach((slide, i) => {
      const d = shortestOffset(i);
      const abs = Math.abs(d);
      const scale = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.62;
      const x = d * span;
      const z = -abs * 140;
      const rot = d * -18;
      slide.classList.toggle("is-active", d === 0);
      slide.style.zIndex = String(20 - abs);
      slide.style.opacity = abs > 2 ? "0" : abs === 2 ? "0.58" : "1";
      slide.style.filter =
        abs === 0
          ? "none"
          : `blur(${Math.min(10, 5 + abs * 2.5)}px) brightness(${Math.max(0.55, 0.78 - abs * 0.12)})`;
      slide.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg) scale(${scale})`;
      slide.toggleAttribute("inert", abs > 1);
    });
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const play = () => {
    stop();
    if (prefersReduced) return;
    timer = window.setInterval(() => goTo(index + 1), 4200);
  };

  const goTo = (nextIndex) => {
    index = (nextIndex + count) % count;
    layout();
    play();
  };

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));

  slides.forEach((slide, i) => {
    slide.addEventListener(
      "click",
      (event) => {
        if (i === index) return;
        event.preventDefault();
        event.stopPropagation();
        goTo(i);
      },
      true
    );
  });

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    dragged = false;
    startX = event.clientX;
    delta = 0;
    stop();
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    delta = event.clientX - startX;
    if (Math.abs(delta) > 10) dragged = true;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (delta < -48) goTo(index + 1);
    else if (delta > 48) goTo(index - 1);
    else play();
  };

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  stage.addEventListener(
    "click",
    (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  });

  carousel.addEventListener("pointerenter", stop);
  carousel.addEventListener("pointerleave", play);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else play();
  });

  window.addEventListener("resize", layout);

  const reveal = () => {
    layout();
    requestAnimationFrame(() => {
      stage.classList.add("is-ready");
      play();
    });
  };

  const images = slides
    .map((slide) => slide.querySelector("img"))
    .filter(Boolean);

  images.forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", layout, { once: true });
    }
  });

  const pending = images.filter((img) => !img.complete);

  if (pending.length) {
    Promise.race([
      Promise.all(
        pending.map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
        )
      ),
      new Promise((resolve) => window.setTimeout(resolve, 900)),
    ]).then(reveal);
  } else {
    reveal();
  }
}
