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
  const navLinks = [...document.querySelectorAll('.site-header .nav-link[href^="#"], .mobile-nav a[href^="#"]')];
  const navMarkers = [
    { element: document.querySelector("#top"), hash: "#top" },
    { element: document.querySelector("#cau-chuyen"), hash: "#cau-chuyen" },
    { element: document.querySelector("#dau-an"), hash: "#dau-an" },
    { element: document.querySelector("#su-menh"), hash: "#su-menh" },
    { element: document.querySelector("#giai-thuong-nha-nuoc"), hash: "#giai-thuong-nha-nuoc" },
    { element: document.querySelector("#video"), hash: "#video" },
    { element: document.querySelector("#giai-thuong"), hash: "#giai-thuong-nha-nuoc" },
    { element: document.querySelector("#dau-an-xuat-ban"), hash: "#dau-an-xuat-ban" }
  ].filter((marker) => marker.element);
  let scrollCueSuppressedUntilExit = false;

  const setActiveNav = (hash) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === hash;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const updateActiveNav = () => {
    const activationLine = window.scrollY + (header?.offsetHeight || 0) + Math.min(window.innerHeight * .24, 180);
    let activeHash = navMarkers[0]?.hash || "#top";
    navMarkers.forEach((marker) => {
      const markerTop = marker.element.getBoundingClientRect().top + window.scrollY;
      if (markerTop <= activationLine) activeHash = marker.hash;
    });
    setActiveNav(activeHash);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveNav(link.getAttribute("href")));
  });

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
    updateActiveNav();
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
  awardRail.setAttribute("aria-label", "Thước thời gian tác phẩm được vinh danh");
  const itemYears = awardItems.map((item) => Number(item.querySelector(".award-year")?.textContent.trim())).filter(Number.isFinite);
  const firstAwardYear = Math.min(...itemYears);
  const lastAwardYear = Math.max(...itemYears);
  const yearButtons = Array.from({ length: lastAwardYear - firstAwardYear + 1 }, (_, index) => {
    const year = firstAwardYear + index;
    const hasItems = itemYears.includes(year);
    const button = document.createElement("button");
    button.className = "timeline-year-button";
    button.classList.toggle("is-major", year % 5 === 0);
    button.classList.toggle("has-items", hasItems);
    button.type = "button";
    button.dataset.year = String(year);
    button.textContent = String(year);
    button.disabled = !hasItems;
    button.setAttribute("aria-label", hasItems ? `Xem tác phẩm năm ${year}` : `Năm ${year}, chưa có dữ liệu`);
    awardRail.append(button);
    return button;
  });
  directoryHead?.append(awardRail);

  const scrollAwardRailTo = (button) => {
    if (!button) return;
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const horizontal = awardRail.scrollWidth > awardRail.clientWidth && awardRail.scrollHeight <= awardRail.clientHeight + 4;
    if (horizontal) {
      const left = button.offsetLeft - (awardRail.clientWidth - button.offsetWidth) / 2;
      awardRail.scrollTo({ left: Math.max(0, left), behavior });
      return;
    }
    const top = button.offsetTop - (awardRail.clientHeight - button.offsetHeight) / 2;
    awardRail.scrollTo({ top: Math.max(0, top), behavior });
  };

  const activateAwardItem = (selectedItem, shouldScroll = false) => {
    if (!selectedItem) return;
    const selectedYear = selectedItem.querySelector(".award-year")?.textContent.trim();
    const selectedIndex = awardItems.indexOf(selectedItem);
    const sameYearItems = awardItems.filter((item) => item.querySelector(".award-year")?.textContent.trim() === selectedYear);
    const sameYearIndex = sameYearItems.indexOf(selectedItem);
    awardItems.forEach((item) => {
      const active = item === selectedItem;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", String(active));
    });
    const activeYearButton = yearButtons.find((button) => button.dataset.year === selectedYear);
    yearButtons.forEach((button) => button.classList.toggle("active", button === activeYearButton));
    selectedItem.querySelector(".award-media-shell")?.append(awardCardNav);
    awardNavPosition.textContent = `${String(selectedIndex + 1).padStart(2, "0")} / ${String(awardItems.length).padStart(2, "0")}`;
    awardNavContext.textContent = sameYearItems.length > 1
      ? `Năm ${selectedYear} · Tác phẩm ${sameYearIndex + 1}/${sameYearItems.length}`
      : `Mốc năm ${selectedYear}`;
    awardPrevButton.disabled = selectedIndex === 0;
    awardNextButton.disabled = selectedIndex === awardItems.length - 1;
    awardPrevButton.setAttribute("aria-label", selectedIndex > 0 ? `Xem tác phẩm trước, mốc ${itemYears[selectedIndex - 1]}` : "Đang ở tác phẩm đầu tiên");
    awardNextButton.setAttribute("aria-label", selectedIndex < awardItems.length - 1 ? `Xem tác phẩm tiếp theo, mốc ${itemYears[selectedIndex + 1]}` : "Đang ở tác phẩm cuối cùng");
    if (shouldScroll) scrollAwardRailTo(activeYearButton);
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
    const mediaShell = document.createElement("div");
    mediaShell.className = "award-media-shell";
    mediaShell.append(media);
    item.append(mediaShell);
    item.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      activateAwardItem(item);
    });
    item.addEventListener("keydown", (event) => {
      if (event.target !== item || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      activateAwardItem(item);
    });

  });

  const awardCardNav = document.createElement("div");
  awardCardNav.className = "award-card-nav";
  awardCardNav.setAttribute("aria-live", "polite");
  const awardNavMeta = document.createElement("p");
  awardNavMeta.className = "award-card-nav-meta";
  const awardNavPosition = document.createElement("span");
  const awardNavContext = document.createElement("strong");
  awardNavMeta.append(awardNavPosition, awardNavContext);
  const awardNavControls = document.createElement("div");
  awardNavControls.className = "award-card-nav-controls";
  const awardPrevButton = document.createElement("button");
  awardPrevButton.type = "button";
  awardPrevButton.dataset.awardPrev = "";
  awardPrevButton.setAttribute("aria-label", "Xem tác phẩm trước");
  const awardPrevIcon = document.createElement("img");
  awardPrevIcon.src = "assets/icons/arrow-left.svg";
  awardPrevIcon.alt = "";
  awardPrevIcon.setAttribute("aria-hidden", "true");
  awardPrevButton.append(awardPrevIcon);
  const awardNextButton = document.createElement("button");
  awardNextButton.type = "button";
  awardNextButton.dataset.awardNext = "";
  awardNextButton.setAttribute("aria-label", "Xem tác phẩm tiếp theo");
  const awardNextIcon = document.createElement("img");
  awardNextIcon.src = "assets/icons/arrow-right.svg";
  awardNextIcon.alt = "";
  awardNextIcon.setAttribute("aria-hidden", "true");
  awardNextButton.append(awardNextIcon);
  awardNavControls.append(awardPrevButton, awardNextButton);
  awardCardNav.append(awardNavMeta, awardNavControls);

  let awardAutoplayTimer = null;
  let awardDirectoryInView = false;
  const reducedAwardMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stopAwardAutoplay = () => {
    window.clearInterval(awardAutoplayTimer);
    awardAutoplayTimer = null;
  };
  const startAwardAutoplay = () => {
    stopAwardAutoplay();
    if (reducedAwardMotion || !awardDirectoryInView || awardDirectory?.classList.contains("is-alltime")) return;
    awardAutoplayTimer = window.setInterval(() => moveAwardItem(1, false), 6000);
  };
  const moveAwardItem = (direction, manual = true) => {
    const currentIndex = Math.max(awardItems.findIndex((item) => item.classList.contains("active")), 0);
    const nextIndex = manual
      ? Math.min(Math.max(currentIndex + direction, 0), awardItems.length - 1)
      : (currentIndex + direction + awardItems.length) % awardItems.length;
    if (nextIndex === currentIndex) return;
    activateAwardItem(awardItems[nextIndex], true);
    if (manual) startAwardAutoplay();
  };
  awardPrevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    moveAwardItem(-1);
  });
  awardNextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    moveAwardItem(1);
  });
  awardDirectory?.addEventListener("keydown", (event) => {
    if (awardDirectory.classList.contains("is-alltime") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    moveAwardItem(event.key === "ArrowLeft" ? -1 : 1);
  });
  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = awardItems.find((item) => item.querySelector(".award-year")?.textContent.trim() === button.dataset.year);
      activateAwardItem(target, true);
      startAwardAutoplay();
    });
  });

  const updateAwardRail = () => {
    yearButtons.forEach((button) => {
      button.disabled = !awardItems.some((item) => item.querySelector(".award-year")?.textContent.trim() === button.dataset.year);
    });
  };

  if ("IntersectionObserver" in window && awardDirectory) {
    const awardAutoplayObserver = new IntersectionObserver(([entry]) => {
      awardDirectoryInView = entry.isIntersecting;
      if (awardDirectoryInView) startAwardAutoplay();
      else stopAwardAutoplay();
    }, { threshold: 0.55 });
    awardAutoplayObserver.observe(awardDirectory);
  }
  awardDirectory?.addEventListener("pointerenter", stopAwardAutoplay);
  awardDirectory?.addEventListener("pointerleave", startAwardAutoplay);
  awardDirectory?.addEventListener("focusin", stopAwardAutoplay);
  awardDirectory?.addEventListener("focusout", (event) => {
    if (!awardDirectory.contains(event.relatedTarget)) startAwardAutoplay();
  });

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
        ? "Nội dung toàn kỳ đang được tổng hợp."
        : "Các tác phẩm có thông tin và bìa sách đã được đối chiếu.";
      if (alltime) stopAwardAutoplay();
      else {
        activateAwardItem(awardItems[0]);
        startAwardAutoplay();
      }
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
