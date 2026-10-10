(() => {
  "use strict";
  /* =========================================================
     DOM READY
     ========================================================= */
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, {
        once: true
      });
    } else {
      callback();
    }
  };
  ready(() => {
    /* =======================================================
       HELPERS
       ======================================================= */
    const $ = (selector, root = document) =>
      root.querySelector(selector);
    const $$ = (selector, root = document) =>
      Array.from(root.querySelectorAll(selector));
    /* =======================================================
       ELEMENTS
       ======================================================= */
    const header = $(".site-header");
    const menuToggle = $("#menuToggle");
    const menuButton = $(".menu-btn");
    const nav = $("#mainNav");
    const cursor = $(".custom-cursor");
    /* =======================================================
       MEDIA QUERIES
       ======================================================= */
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const finePointerQuery = window.matchMedia(
      "(pointer: fine)"
    );
    const reduceMotion = reduceMotionQuery.matches;
    const finePointer = finePointerQuery.matches;
    /* =======================================================
       HEADER
       ======================================================= */
    let scrollPending = false;
    const updateHeader = () => {
      if (!header) return;
      header.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );
      scrollPending = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (scrollPending) return;
        scrollPending = true;
        window.requestAnimationFrame(updateHeader);
      },
      {
        passive: true
      }
    );
    updateHeader();
    /* =======================================================
       MOBILE MENU
       ======================================================= */
    const syncMenuState = () => {
      if (!menuToggle || !menuButton) return;
      const isOpen = menuToggle.checked;
      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    };
    const closeMenu = ({
      returnFocus = false
    } = {}) => {
      if (!menuToggle || !menuToggle.checked) return;
      menuToggle.checked = false;
      syncMenuState();
      if (returnFocus && menuButton) {
        menuButton.focus();
      }
    };
    if (menuToggle && nav && menuButton) {
      /*
        Native button:
        Enter + Space already trigger click automatically.
        No custom keydown listener is needed.
      */
      menuButton.addEventListener("click", () => {
        menuToggle.checked = !menuToggle.checked;
        syncMenuState();
      });
      menuToggle.addEventListener(
        "change",
        syncMenuState
      );
      syncMenuState();
      /* Close menu when navigation link is clicked */
      $$("a", nav).forEach((link) => {
        link.addEventListener("click", () => {
          closeMenu();
        });
      });
      /* Close when clicking outside */
      document.addEventListener("click", (event) => {
        if (!menuToggle.checked) return;
        const target = event.target;
        if (
          nav.contains(target) ||
          menuButton.contains(target)
        ) {
          return;
        }
        closeMenu();
      });
      /* Close with Escape */
      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          menuToggle.checked
        ) {
          closeMenu({
            returnFocus: true
          });
        }
      });
      /* Close menu when returning to desktop */
      const desktopQuery = window.matchMedia(
        "(min-width: 951px)"
      );
      const handleDesktopChange = (event) => {
        if (event.matches) {
          closeMenu();
        }
      };
      if (
        typeof desktopQuery.addEventListener ===
        "function"
      ) {
        desktopQuery.addEventListener(
          "change",
          handleDesktopChange
        );
      } else if (typeof desktopQuery.addListener === "function") {
        desktopQuery.addListener(handleDesktopChange);
      }
    }
    /* =======================================================
       REVEAL ANIMATIONS
       ======================================================= */
    const revealItems = $$(".reveal");
    if (
      reduceMotion ||
      !("IntersectionObserver" in window)
    ) {
      revealItems.forEach((item) => {
        item.classList.add("visible");
      });
    } else if (revealItems.length) {
      const observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            currentObserver.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -30px 0px"
        }
      );
      revealItems.forEach((item) => {
        observer.observe(item);
      });
    }
    /* =======================================================
       LAZY IMAGE LOADING
       ======================================================= */
    $$('img[loading="lazy"]').forEach((img) => {
      const markLoaded = () => {
        img.classList.add("loaded");
      };
      if (img.complete) {
        markLoaded();
        return;
      }
      img.addEventListener(
        "load",
        markLoaded,
        {
          once: true
        }
      );
      img.addEventListener(
        "error",
        markLoaded,
        {
          once: true
        }
      );
    });
    /* =======================================================
       SMOOTH INTERNAL LINKS
       ======================================================= */
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        let target;
        try {
          target = document.querySelector(href);
        } catch {
          return;
        }
        if (!target) return;
        event.preventDefault();
        const headerOffset =
          header?.getBoundingClientRect().height || 0;
        const targetTop =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerOffset -
          8;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reduceMotion ? "auto" : "smooth"
        });
        if (!target.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
          target.setAttribute("tabindex", "-1");
        }
        if (typeof target.focus === "function") target.focus({ preventScroll: true });
        closeMenu();
      });
    });
    /* =======================================================
       CUSTOM CURSOR
       ======================================================= */
    if (
      cursor &&
      finePointer &&
      !reduceMotion
    ) {
      document.body.classList.add(
        "has-custom-cursor"
      );
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let currentX = mouseX;
      let currentY = mouseY;
      let pointerSeen = false;
      window.addEventListener(
        "mousemove",
        (event) => {
          mouseX = event.clientX;
          mouseY = event.clientY;
          if (!pointerSeen) {
            pointerSeen = true;
            cursor.classList.add(
              "is-visible"
            );
          }
        },
        {
          passive: true
        }
      );
      const animateCursor = () => {
        currentX +=
          (mouseX - currentX) * 0.18;
        currentY +=
          (mouseY - currentY) * 0.18;
        cursor.style.transform =
          `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        window.requestAnimationFrame(
          animateCursor
        );
      };
      window.requestAnimationFrame(
        animateCursor
      );
      /* Cursor hover state */
      $$(
        "a, button, input, select, textarea"
      ).forEach((element) => {
        element.addEventListener(
          "mouseenter",
          () => {
            cursor.classList.add(
              "is-hover"
            );
          }
        );
        element.addEventListener(
          "mouseleave",
          () => {
            cursor.classList.remove(
              "is-hover"
            );
          }
        );
      });
      document.addEventListener(
        "mouseleave",
        () => {
          cursor.classList.remove(
            "is-visible"
          );
        }
      );
      document.addEventListener(
        "mouseenter",
        () => {
          if (pointerSeen) {
            cursor.classList.add(
              "is-visible"
            );
          }
        }
      );
    }
    /* =======================================================
       JS READY
       ======================================================= */
    /*
      Added at the very end so reveal animations
      progressively enhance the page.
      If JS fails completely, .reveal stays visible.
    */
    document.documentElement.classList.add(
      "js-ready"
    );
  });
})();
