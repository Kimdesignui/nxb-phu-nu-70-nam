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
    [3, "assets/images/book-tu-du-2026.webp"],
    [6, "assets/images/book-chernobyl.jpg"],
    [7, "assets/images/book-co-be-nhin-mua-2026.webp"],
    [10, "assets/images/book-bac-hana-2026.webp"]
  ]);
  const featuredGalleryKeys = new Map([
    [3, "tu-du"],
    [6, "chernobyl"],
    [7, "co-be-nhin-mua"],
    [10, "bac-hana"]
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
    const titleElement = item.querySelector("h4");
    const title = titleElement?.textContent.trim() || "Tác phẩm được vinh danh";
    const year = item.querySelector(".award-year")?.textContent.trim();
    const galleryKey = featuredGalleryKeys.get(index);
    item.tabIndex = 0;
    item.setAttribute("role", galleryKey ? "group" : "button");
    item.setAttribute("aria-label", galleryKey ? `Mốc ${year}: ${title}. Có thư viện ảnh` : `Xem mốc ${year}: ${title}`);
    if (galleryKey) item.classList.add("has-gallery");
    const media = document.createElement(galleryKey ? "button" : "div");
    media.className = "award-card-media";
    const coverPath = featuredCoverPaths.get(index);
    if (galleryKey) {
      media.type = "button";
      media.dataset.galleryOpen = "";
      media.setAttribute("aria-label", `Xem thư viện ảnh sách ${title}`);
      media.addEventListener("click", (event) => {
        event.stopPropagation();
        openBookGallery(galleryKey, media);
      });
    }
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
    if (galleryKey && titleElement) {
      const titleButton = document.createElement("button");
      titleButton.className = "timeline-gallery-title";
      titleButton.type = "button";
      titleButton.dataset.galleryOpen = "";
      titleButton.textContent = title;
      titleButton.setAttribute("aria-label", `Xem thư viện ảnh sách ${title}`);
      titleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openBookGallery(galleryKey, titleButton);
      });
      titleElement.replaceChildren(titleButton);
    }
    item.append(media);
    item.addEventListener("click", () => activateAwardItem(item));
    item.addEventListener("keydown", (event) => {
      if (event.target !== item || !["Enter", " "].includes(event.key)) return;
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

  const bookGalleryData = {
    "state-honors": {
      eyebrow: "Gi\u1ea3i th\u01b0\u1edfng Nh\u00e0 n\u01b0\u1edbc",
      title: "Nh\u1eefng th\u00e0nh t\u00edch \u0111\u00e3 \u0111\u1ea1t \u0111\u01b0\u1ee3c",
      images: [
        ["assets/images/state-honors-detail.png", "Ba Hu\u00e2n ch\u01b0\u01a1ng \u0110\u1ed9c l\u1eadp trao t\u1eb7ng Nh\u00e0 xu\u1ea5t b\u1ea3n Ph\u1ee5 n\u1eef Vi\u1ec7t Nam"]
      ]
    },
    "tu-du": {
      title: "Từ Dụ thái hậu",
      images: [
        ["assets/images/gallery-tu-du-01.webp", "Bìa Từ Dụ thái hậu, Quyển Thượng"],
        ["assets/images/gallery-tu-du-02.webp", "Bìa Từ Dụ thái hậu, Quyển Hạ"],
        ["assets/images/gallery-tu-du-03.webp", "Bộ sách Từ Dụ thái hậu bên bộ ấm trà"],
        ["assets/images/gallery-tu-du-04.webp", "Hai quyển Từ Dụ thái hậu được trưng bày"]
      ]
    },
    "chernobyl": {
      title: "Lời nguyện cầu Chernobyl",
      images: [
        ["assets/images/gallery-chernobyl-01.webp", "Bìa sách Lời nguyện cầu Chernobyl"],
        ["assets/images/gallery-chernobyl-02.webp", "Sách Lời nguyện cầu Chernobyl được giới thiệu ngoài trời"]
      ]
    },
    "co-be-nhin-mua": {
      title: "Cô bé nhìn mưa",
      images: [
        ["assets/images/gallery-co-be-nhin-mua-01.webp", "Bìa sách Cô bé nhìn mưa"],
        ["assets/images/gallery-co-be-nhin-mua-02.webp", "Mô hình sách Cô bé nhìn mưa"],
        ["assets/images/gallery-co-be-nhin-mua-03.webp", "Bìa trước, gáy và bìa sau sách Cô bé nhìn mưa"]
      ]
    },
    "bac-hana": {
      title: "Bác Hana",
      images: [
        ["assets/images/gallery-bac-hana-01.webp", "Bìa sách Bác Hana"],
        ["assets/images/gallery-bac-hana-02.webp", "Sách Bác Hana trên bàn gỗ cùng hoa khô"],
        ["assets/images/gallery-bac-hana-03.webp", "Sách Bác Hana bên hoa đồng tiền hồng"],
        ["assets/images/gallery-bac-hana-04.webp", "Sách Bác Hana trên nền vải đỏ"]
      ]
    }
  };
  const bookGalleryDialog = document.querySelector("#bookGalleryDialog");
  const bookGalleryTitle = bookGalleryDialog?.querySelector("#bookGalleryTitle");
  const bookGalleryEyebrow = bookGalleryDialog?.querySelector("[data-gallery-eyebrow]");
  const bookGalleryImage = bookGalleryDialog?.querySelector("[data-gallery-image]");
  const bookGalleryCaption = bookGalleryDialog?.querySelector("[data-gallery-caption]");
  const bookGalleryCounter = bookGalleryDialog?.querySelector("[data-gallery-counter]");
  const bookGalleryThumbnails = bookGalleryDialog?.querySelector("[data-gallery-thumbnails]");
  let activeBookGallery = null;
  let activeBookGalleryIndex = 0;
  let bookGalleryTrigger = null;
  let bookGalleryPointerStart = null;

  const renderBookGallery = () => {
    if (!activeBookGallery || !bookGalleryImage) return;
    const [source, description] = activeBookGallery.images[activeBookGalleryIndex];
    bookGalleryImage.src = source;
    bookGalleryImage.alt = description;
    if (bookGalleryCaption) bookGalleryCaption.textContent = description;
    if (bookGalleryCounter) bookGalleryCounter.textContent = `Ảnh ${activeBookGalleryIndex + 1} / ${activeBookGallery.images.length}`;
    bookGalleryThumbnails?.querySelectorAll(".book-gallery-thumb").forEach((thumbnail, index) => {
      const active = index === activeBookGalleryIndex;
      thumbnail.classList.toggle("active", active);
      thumbnail.setAttribute("aria-current", String(active));
      if (active) thumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });
  };

  const moveBookGallery = (direction) => {
    if (!activeBookGallery) return;
    activeBookGalleryIndex = (activeBookGalleryIndex + direction + activeBookGallery.images.length) % activeBookGallery.images.length;
    renderBookGallery();
  };

  const openBookGallery = (key, trigger) => {
    const gallery = bookGalleryData[key];
    if (!gallery || !bookGalleryDialog || !bookGalleryThumbnails) return;
    activeBookGallery = gallery;
    activeBookGalleryIndex = 0;
    bookGalleryTrigger = trigger;
    if (bookGalleryTitle) bookGalleryTitle.textContent = gallery.title;
    if (bookGalleryEyebrow) bookGalleryEyebrow.textContent = gallery.eyebrow || "S\u00e1ch \u0111\u1ea1t gi\u1ea3i th\u01b0\u1edfng";
    bookGalleryDialog.classList.toggle("single-image", gallery.images.length === 1);
    bookGalleryThumbnails.replaceChildren();
    gallery.images.forEach(([source, description], index) => {
      const thumbnail = document.createElement("button");
      thumbnail.className = "book-gallery-thumb";
      thumbnail.type = "button";
      thumbnail.setAttribute("aria-label", `Xem ảnh ${index + 1}: ${description}`);
      const image = document.createElement("img");
      image.src = source;
      image.alt = "";
      image.loading = "lazy";
      thumbnail.append(image);
      thumbnail.addEventListener("click", () => {
        activeBookGalleryIndex = index;
        renderBookGallery();
      });
      bookGalleryThumbnails.append(thumbnail);
    });
    renderBookGallery();
    bookGalleryDialog.showModal();
  };

  document.querySelectorAll("[data-book-gallery]").forEach((card) => {
    card.querySelectorAll("[data-gallery-open]").forEach((trigger) => {
      trigger.addEventListener("click", () => openBookGallery(card.dataset.bookGallery, trigger));
    });
  });
  bookGalleryDialog?.querySelector("[data-gallery-close]")?.addEventListener("click", () => bookGalleryDialog.close());
  bookGalleryDialog?.querySelector("[data-gallery-prev]")?.addEventListener("click", () => moveBookGallery(-1));
  bookGalleryDialog?.querySelector("[data-gallery-next]")?.addEventListener("click", () => moveBookGallery(1));
  bookGalleryDialog?.addEventListener("click", (event) => {
    if (event.target === bookGalleryDialog) bookGalleryDialog.close();
  });
  bookGalleryDialog?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveBookGallery(-1);
    if (event.key === "ArrowRight") moveBookGallery(1);
    if (event.key === "Home" && activeBookGallery) {
      activeBookGalleryIndex = 0;
      renderBookGallery();
    }
    if (event.key === "End" && activeBookGallery) {
      activeBookGalleryIndex = activeBookGallery.images.length - 1;
      renderBookGallery();
    }
  });
  bookGalleryDialog?.addEventListener("close", () => {
    bookGalleryImage?.removeAttribute("src");
    bookGalleryTrigger?.focus();
  });
  bookGalleryDialog?.querySelector(".book-gallery-frame")?.addEventListener("pointerdown", (event) => {
    bookGalleryPointerStart = event.clientX;
  });
  bookGalleryDialog?.querySelector(".book-gallery-frame")?.addEventListener("pointerup", (event) => {
    if (bookGalleryPointerStart === null) return;
    const distance = event.clientX - bookGalleryPointerStart;
    bookGalleryPointerStart = null;
    if (Math.abs(distance) > 45) moveBookGallery(distance > 0 ? -1 : 1);
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
