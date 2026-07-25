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
  const scrollCue = document.querySelector("[data-scroll-cue]");
  const storySection = document.querySelector("#cau-chuyen");
  let scrollCueSuppressedUntilExit = false;

  const setScrollCueVisibility = (visible) => {
    if (!scrollCue) return;
    scrollCue.classList.toggle("is-hidden", !visible);
    scrollCue.setAttribute("aria-hidden", String(!visible));
    scrollCue.disabled = !visible;
  };

  scrollCue?.addEventListener("click", () => {
    scrollCueSuppressedUntilExit = true;
    setScrollCueVisibility(false);
    if (!storySection) return;
    const offset = (header?.offsetHeight || 0) + 16;
    const targetTop = storySection.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetTop, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  const updateScroll = () => {
    const top = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("is-scrolled", top > 18);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? top / max : 0})`;
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const isInHero = !storySection || storySection.getBoundingClientRect().top > headerBottom + 32;
    if (!isInHero) scrollCueSuppressedUntilExit = false;
    setScrollCueVisibility(isInHero && !scrollCueSuppressedUntilExit);
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

  const buttons = [...document.querySelectorAll("[data-filter]")];
  const awardList = document.querySelector(".award-list");
  const awardItems = [...document.querySelectorAll(".award-list article[data-period]")];
  const featuredCoverPaths = new Map([
    [3, "assets/images/book-tu-du.jpg"],
    [6, "assets/images/book-chernobyl.jpg"],
    [7, "assets/images/book-co-be-nhin-mua.jpg"],
    [10, "assets/images/book-bac-hana.jpg"]
  ]);
  const awardYears = [...new Set(awardItems.map((item) => item.querySelector(".award-year")?.textContent.trim()).filter(Boolean))];
  const awardRail = document.createElement("div");
  awardRail.className = "award-timeline-rail";
  awardRail.setAttribute("aria-label", "Các mốc năm tác phẩm được vinh danh");
  const yearButtons = awardYears.map((year) => {
    const button = document.createElement("button");
    button.className = "timeline-year-button";
    button.type = "button";
    button.dataset.year = year;
    button.textContent = year;
    awardRail.append(button);
    return button;
  });
  awardList?.after(awardRail);

  const activateAwardItem = (selectedItem, shouldScroll = false) => {
    if (!selectedItem) return;
    const selectedYear = selectedItem.querySelector(".award-year")?.textContent.trim();
    awardItems.forEach((item) => {
      const active = item === selectedItem;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", String(active));
    });
    yearButtons.forEach((button) => button.classList.toggle("active", button.dataset.year === selectedYear));
    if (shouldScroll) selectedItem.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  awardItems.forEach((item, index) => {
    const title = item.querySelector("h4")?.textContent.trim() || "Tác phẩm được vinh danh";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Xem mốc ${item.querySelector(".award-year")?.textContent.trim()}: ${title}`);
    const media = document.createElement("div");
    media.className = "award-card-media";
    const coverPath = featuredCoverPaths.get(index);
    if (coverPath) {
      const image = document.createElement("img");
      image.src = coverPath;
      image.alt = `Bìa sách ${title}`;
      image.loading = "lazy";
      media.append(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "award-cover-placeholder";
      const icon = document.createElement("i");
      icon.className = "bi bi-book";
      icon.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.textContent = "Bìa sách đang cập nhật";
      placeholder.append(icon, label);
      media.append(placeholder);
    }
    item.append(media);
    item.addEventListener("click", () => activateAwardItem(item));
    item.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      activateAwardItem(item);
    });

  });

  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = awardItems.find((item) => !item.classList.contains("hidden") && item.querySelector(".award-year")?.textContent.trim() === button.dataset.year);
      activateAwardItem(target, true);
    });
  });

  const updateAwardRail = () => {
    yearButtons.forEach((button) => {
      const available = awardItems.some((item) => !item.classList.contains("hidden") && item.querySelector(".award-year")?.textContent.trim() === button.dataset.year);
      button.classList.toggle("hidden", !available);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      awardItems.forEach((item) => item.classList.toggle("hidden", filter !== "all" && item.dataset.period !== filter));
      updateAwardRail();
      activateAwardItem(awardItems.find((item) => !item.classList.contains("hidden")), true);
    });
  });
  updateAwardRail();
  activateAwardItem(awardItems[0]);

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
