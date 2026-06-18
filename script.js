(function () {
  var doc = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.querySelector("[data-tech-canvas]");
  var progressBar = document.querySelector(".scroll-progress span");
  var pointer = { x: window.innerWidth * 0.72, y: window.innerHeight * 0.38 };
  var targetPointer = { x: pointer.x, y: pointer.y };
  var scrollProgress = 0;

  doc.classList.add("js-ready");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateProgress() {
    var maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    scrollProgress = clamp(window.scrollY / maxScroll, 0, 1);
    doc.style.setProperty("--scroll-progress", scrollProgress.toFixed(4));
    if (progressBar) {
      progressBar.style.transform = "scaleY(" + scrollProgress + ")";
    }
  }

  function updateParallax() {
    var heroProgress = clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1);
    var mid = document.querySelector(".scene-mid");
    var front = document.querySelector(".scene-front");
    var copy = document.querySelector(".hero-copy");

    if (mid) {
      mid.style.transform = "translate3d(" + (-2 - heroProgress * 6) + "%, " + (heroProgress * 8) + "%, 0) scale(" + (1.04 + heroProgress * 0.08) + ")";
    }

    if (front) {
      front.style.transform = "translate3d(" + (-heroProgress * 7) + "%, " + (-heroProgress * 4) + "%, 0) scale(" + (1.05 + heroProgress * 0.12) + ")";
    }

    if (copy) {
      copy.style.transform = "translate3d(0, " + (heroProgress * -26) + "px, 0)";
      copy.style.opacity = String(1 - heroProgress * 0.34);
    }
  }

  function revealOnScroll() {
    var items = document.querySelectorAll(".trust-strip div, .shot, .story-copy, .stage-card, .plan-card, .split > *, .faq-grid article");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (item, index) {
      item.classList.add("motion-reveal");
      item.style.setProperty("--reveal-delay", Math.min(index % 4, 3) * 70 + "ms");
      observer.observe(item);
    });
  }

  function setupGsap() {
    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      return;
    }

    doc.classList.add("gsap-ready");
    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.utils.toArray(".shot").forEach(function (shot) {
      window.gsap.fromTo(shot.querySelector(".shot-media"), {
        y: 80,
        rotateX: 7,
        scale: 0.94
      }, {
        y: -18,
        rotateX: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: shot,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    window.gsap.to(".stage-card-one", {
      xPercent: -14,
      yPercent: -18,
      rotate: -3,
      scrollTrigger: {
        trigger: ".motion-story",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    window.gsap.to(".stage-card-two", {
      xPercent: 10,
      yPercent: 12,
      rotate: 2,
      scrollTrigger: {
        trigger: ".motion-story",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    window.gsap.to(".stage-card-three", {
      xPercent: -5,
      yPercent: 22,
      rotate: -1,
      scrollTrigger: {
        trigger: ".motion-story",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  function setupCanvas() {
    if (!canvas || prefersReducedMotion) {
      return;
    }

    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var dpr = 1;
    var nodes = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var amount = clamp(Math.floor(width / 32), 18, 52);
      nodes = Array.from({ length: amount }, function (_, index) {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          base: Math.random() * Math.PI * 2,
          speed: 0.22 + Math.random() * 0.42,
          radius: 1.2 + Math.random() * 2.8,
          link: index % 3 === 0
        };
      });
    }

    function draw(time) {
      var t = time * 0.001;
      pointer.x += (targetPointer.x - pointer.x) * 0.08;
      pointer.y += (targetPointer.y - pointer.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      var gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(width, height) * 0.72);
      gradient.addColorStop(0, "rgba(33, 167, 101, 0.18)");
      gradient.addColorStop(0.38, "rgba(16, 139, 132, 0.08)");
      gradient.addColorStop(1, "rgba(7, 9, 8, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      nodes.forEach(function (node, index) {
        var phase = t * node.speed + node.base + scrollProgress * 5;
        var x = node.x + Math.cos(phase) * 18 + (pointer.x - width / 2) * 0.018;
        var y = node.y + Math.sin(phase * 0.8) * 22 + scrollProgress * 90;
        y = ((y % (height + 80)) + height + 80) % (height + 80) - 40;

        ctx.beginPath();
        ctx.arc(x, y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = index % 5 === 0 ? "rgba(241, 191, 75, 0.45)" : "rgba(255, 255, 255, 0.24)";
        ctx.fill();

        if (node.link && index + 1 < nodes.length) {
          var next = nodes[index + 1];
          var nx = next.x + Math.cos(t * next.speed + next.base) * 18;
          var ny = next.y + Math.sin(t * next.speed + next.base) * 22;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.stroke();
        }
      });

      ctx.beginPath();
      for (var i = 0; i <= width; i += 18) {
        var wave = Math.sin(i * 0.012 + t * 0.9 + scrollProgress * 8) * 18;
        var yLine = height * 0.72 + wave;
        if (i === 0) {
          ctx.moveTo(i, yLine);
        } else {
          ctx.lineTo(i, yLine);
        }
      }
      ctx.strokeStyle = "rgba(33, 167, 101, 0.15)";
      ctx.stroke();

      window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", function (event) {
      targetPointer.x = event.clientX;
      targetPointer.y = event.clientY;
    }, { passive: true });

    resize();
    window.requestAnimationFrame(draw);
  }

  function onScroll() {
    updateProgress();
    if (!prefersReducedMotion) {
      updateParallax();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  revealOnScroll();
  setupCanvas();
  setupGsap();
  onScroll();
})();
