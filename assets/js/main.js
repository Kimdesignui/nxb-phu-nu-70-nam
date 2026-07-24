(() => {
  "use strict";

  const introLoader = document.querySelector("[data-intro-loader]");
  if (introLoader) {
    const removeIntroLoader = () => {
      if (introLoader.isConnected) introLoader.remove();
    };
    introLoader.addEventListener("animationend", (event) => {
      if (event.target === introLoader) removeIntroLoader();
    });
    window.setTimeout(removeIntroLoader, 3800);
  }
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");

  const updateScroll = () => {
    const top = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("is-scrolled", top > 18);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? top / max : 0})`;
  };

  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6%" });
    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
  } else {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
  }

  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count || 0);
        const started = performance.now();
        const tick = (now) => {
          const ratio = Math.min((now - started) / 1250, 1);
          const eased = 1 - Math.pow(1 - ratio, 3);
          const value = Math.floor(target * eased);
          element.textContent = element.dataset.format === "plain" ? String(value) : value.toLocaleString("vi-VN");
          if (ratio < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(element);
      });
    }, { threshold: 0.7 });
    counters.forEach((counter) => countObserver.observe(counter));
  }

  const buttons = document.querySelectorAll("[data-filter]");
  const awardItems = document.querySelectorAll(".award-list article[data-period]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      awardItems.forEach((item) => item.classList.toggle("hidden", filter !== "all" && item.dataset.period !== filter));
    });
  });

  const videoDeck = document.querySelector("[data-video-deck]");
  const videoCards = videoDeck ? [...videoDeck.querySelectorAll("[data-video-card]")] : [];
  const videoFeedback = document.querySelector("[data-video-feedback]");
  const videoDialog = document.querySelector("#videoDialog");
  const videoFrame = videoDialog?.querySelector("iframe");
  const videoDialogTitle = videoDialog?.querySelector("#videoDialogTitle");

  const activateVideoCard = (selectedCard) => {
    const activeIndex = videoCards.indexOf(selectedCard);
    videoCards.forEach((card, index) => {
      const delta = (index - activeIndex + videoCards.length) % videoCards.length;
      card.dataset.position = delta === 0 ? "0" : delta === 1 ? "1" : "-1";
      card.setAttribute("aria-current", delta === 0 ? "true" : "false");
    });
    if (videoFeedback) videoFeedback.textContent = "";
  };

  const openVideoCard = (card) => {
    const compactVideoDeck = window.matchMedia("(max-width: 767.98px)").matches;
    if (card.dataset.position !== "0" && !compactVideoDeck) {
      activateVideoCard(card);
      return;
    }

    const videoUrl = card.dataset.videoUrl;
    if (!videoUrl) {
      if (videoFeedback) videoFeedback.textContent = "Video này đang được cập nhật. Bạn có thể xem các thẻ khác.";
      return;
    }

    if (videoFrame) videoFrame.src = videoUrl;
    if (videoDialogTitle) videoDialogTitle.textContent = card.querySelector("h3")?.textContent || "Thước phim hành trình";
    videoDialog?.showModal();
  };

  videoCards.forEach((card) => {
    card.addEventListener("pointerenter", () => activateVideoCard(card));
    card.addEventListener("focusin", () => activateVideoCard(card));
    card.addEventListener("click", () => openVideoCard(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openVideoCard(card);
    });
  });

  const closeVideoDialog = () => videoDialog?.close();
  videoDialog?.querySelector("[data-video-close]")?.addEventListener("click", closeVideoDialog);
  videoDialog?.addEventListener("click", (event) => {
    if (event.target === videoDialog) closeVideoDialog();
  });
  videoDialog?.addEventListener("close", () => {
    if (videoFrame) videoFrame.src = "";
  });
})();
