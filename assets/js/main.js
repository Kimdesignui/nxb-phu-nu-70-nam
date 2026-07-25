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

  const awardList = document.querySelector(".award-list");
  const awardItems = [...document.querySelectorAll(".award-list article[data-period]")];
  const directoryHead = document.querySelector(".directory-head");
  const awardDirectory = document.querySelector("[data-award-directory]");
  const awardViewTabs = [...document.querySelectorAll("[data-award-view]")];
  const awardPeriod = document.querySelector("[data-award-period]");
  const awardPeriodCopy = document.querySelector("[data-award-period-copy]");
  const awardNote = document.querySelector("[data-award-note]");
  const featuredCoverPaths = new Map([
    [0, "assets/images/award-tam-trieu-vua-ly.jpg"],
    [1, "assets/images/award-mot-diem-tinh-hoa.jpg"],
    [2, "assets/images/award-duoc-hoc.jpg"],
    [3, "assets/images/book-tu-du-2026.webp"],
    [4, "assets/images/award-con-da-ve-nha.jpg"],
    [5, "assets/images/award-giao-duc-viet-nam.jpg"],
    [6, "assets/images/book-chernobyl.jpg"],
    [7, "assets/images/book-co-be-nhin-mua-2026.webp"],
    [8, "assets/images/award-chau-phi-nghin-trung.png"],
    [9, "assets/images/award-khai-niem-then-chot-gioi.jpg"],
    [10, "assets/images/book-bac-hana-2026.webp"],
    [11, "assets/images/award-uoc-vong-hoc-duong.jpg"],
    [12, "assets/images/award-tren-dinh-gioi.jpg"],
    [13, "assets/images/award-duong-mon-ho-chi-minh.jpg"]
  ]);
  const featuredGalleryKeys = new Map([
    [0, "tam-trieu-vua-ly"],
    [1, "mot-diem-tinh-hoa"],
    [2, "duoc-hoc"],
    [3, "tu-du"],
    [4, "con-da-ve-nha"],
    [5, "giao-duc-viet-nam"],
    [6, "chernobyl"],
    [7, "co-be-nhin-mua"],
    [8, "chau-phi-nghin-trung"],
    [9, "khai-niem-then-chot-gioi"],
    [10, "bac-hana"],
    [11, "uoc-vong-hoc-duong"],
    [12, "tren-dinh-gioi"],
    [13, "duong-mon-ho-chi-minh"]
  ]);
  const awardRail = document.createElement("div");
  awardRail.className = "award-timeline-rail";
  awardRail.setAttribute("aria-label", "Các mốc năm tác phẩm được vinh danh");
  const yearButtons = awardItems.map((item, index) => {
    const year = item.querySelector(".award-year")?.textContent.trim() || "";
    const title = item.querySelector("h4")?.textContent.trim() || "tác phẩm";
    const button = document.createElement("button");
    button.className = "timeline-year-button";
    button.type = "button";
    button.dataset.itemIndex = String(index);
    button.textContent = year;
    button.setAttribute("aria-label", `${year}: ${title}`);
    awardRail.append(button);
    return button;
  });
  directoryHead?.append(awardRail);

  const activateAwardItem = (selectedItem, shouldScroll = false) => {
    if (!selectedItem) return;
    const selectedIndex = awardItems.indexOf(selectedItem);
    awardItems.forEach((item) => {
      const active = item === selectedItem;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", String(active));
    });
    yearButtons.forEach((button, index) => button.classList.toggle("active", index === selectedIndex));
    if (shouldScroll) yearButtons[selectedIndex]?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
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

  const awardCardNav = document.createElement("div");
  awardCardNav.className = "award-card-nav";
  const awardPrevButton = document.createElement("button");
  awardPrevButton.type = "button";
  awardPrevButton.setAttribute("aria-label", "Xem tác phẩm trước");
  awardPrevButton.innerHTML = '<i class="bi bi-arrow-left" aria-hidden="true"></i>';
  const awardNextButton = document.createElement("button");
  awardNextButton.type = "button";
  awardNextButton.setAttribute("aria-label", "Xem tác phẩm tiếp theo");
  awardNextButton.innerHTML = '<i class="bi bi-arrow-right" aria-hidden="true"></i>';
  awardCardNav.append(awardPrevButton, awardNextButton);
  awardList?.append(awardCardNav);

  const moveAwardItem = (direction) => {
    const currentIndex = Math.max(awardItems.findIndex((item) => item.classList.contains("active")), 0);
    const nextIndex = (currentIndex + direction + awardItems.length) % awardItems.length;
    activateAwardItem(awardItems[nextIndex], true);
  };
  awardPrevButton.addEventListener("click", () => moveAwardItem(-1));
  awardNextButton.addEventListener("click", () => moveAwardItem(1));
  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activateAwardItem(awardItems[Number(button.dataset.itemIndex)], true);
    });
  });

  const updateAwardRail = () => {
    yearButtons.forEach((button, index) => button.classList.toggle("hidden", awardItems[index]?.classList.contains("hidden")));
  };

  awardViewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const alltime = tab.dataset.awardView === "alltime";
      awardViewTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      awardDirectory?.classList.toggle("is-alltime", alltime);
      if (awardPeriod) awardPeriod.textContent = alltime ? "1957–2025" : "2017–2025";
      if (awardPeriodCopy) awardPeriodCopy.textContent = alltime
        ? "Toàn bộ hành trình được trình bày theo dữ liệu hiện có; các mốc trước năm 2017 đang tiếp tục bổ sung."
        : "Các tác phẩm có thông tin và bìa sách đã được đối chiếu.";
      if (awardNote) awardNote.textContent = alltime
        ? "Danh mục toàn kỳ 1957–2025 đang được Nhà xuất bản tiếp tục cập nhật; hiện hiển thị các tác phẩm đã xác minh từ năm 2017."
        : "Hiển thị các tác phẩm được vinh danh trong giai đoạn 2017–2025.";
      activateAwardItem(awardItems[0]);
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
    "tam-trieu-vua-ly": {
      title: "Tám triều vua Lý",
      images: [["assets/images/award-tam-trieu-vua-ly.jpg", "Bộ sách Tám triều vua Lý"]]
    },
    "mot-diem-tinh-hoa": {
      title: "Một Điểm tinh hoa",
      images: [["assets/images/award-mot-diem-tinh-hoa.jpg", "Bìa sách Một Điểm tinh hoa"]]
    },
    "duoc-hoc": {
      title: "Được học",
      images: [["assets/images/award-duoc-hoc.jpg", "Bìa sách Được học"]]
    },
    "con-da-ve-nha": {
      title: "Con đã về nhà",
      images: [["assets/images/award-con-da-ve-nha.jpg", "Bìa sách Con đã về nhà"]]
    },
    "giao-duc-viet-nam": {
      title: "Giáo dục Việt Nam học gì từ Nhật Bản",
      images: [["assets/images/award-giao-duc-viet-nam.jpg", "Bìa sách Giáo dục Việt Nam học gì từ Nhật Bản"]]
    },
    "chau-phi-nghin-trung": {
      title: "Châu Phi nghìn trùng",
      images: [["assets/images/award-chau-phi-nghin-trung.png", "Bìa sách Châu Phi nghìn trùng"]]
    },
    "khai-niem-then-chot-gioi": {
      title: "Những khái niệm then chốt giới",
      images: [["assets/images/award-khai-niem-then-chot-gioi.jpg", "Bìa sách Những khái niệm then chốt giới"]]
    },
    "uoc-vong-hoc-duong": {
      title: "Ước vọng cho học đường",
      images: [["assets/images/award-uoc-vong-hoc-duong.jpg", "Bìa sách Ước vọng cho học đường"]]
    },
    "tren-dinh-gioi": {
      title: "Trên đỉnh giời",
      images: [["assets/images/award-tren-dinh-gioi.jpg", "Bìa sách Trên đỉnh giời"]]
    },
    "duong-mon-ho-chi-minh": {
      title: "Đường mòn Hồ Chí Minh",
      images: [["assets/images/award-duong-mon-ho-chi-minh.jpg", "Bìa sách Đường mòn Hồ Chí Minh"]]
    },    "tu-du": {
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
