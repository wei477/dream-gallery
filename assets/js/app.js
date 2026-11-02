(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const scenes = [
    { name: "樱之庭", en: "CHERRY BLOSSOM GARDEN", label: "A SPRING DREAM", image: "assets/images/exhibit-cherry.jpg", description: "春风经过枝头，花瓣便把天空写成温柔的粉色。沿着花影小径慢慢走，听见风，也听见心里安静的声音。" },
    { name: "月光回廊", en: "MOONLIT CORRIDOR", label: "A QUIET MOON", image: "assets/images/exhibit-moon.jpg", description: "月亮停在远方的湖面，银色微光落在玻璃穹顶。这里没有匆忙的脚步，只有星辰陪你走过漫长而宁静的夜。" },
    { name: "海蓝秘境", en: "AZURE SANCTUARY", label: "A BLUE HORIZON", image: "assets/images/exhibit-ocean.jpg", description: "深蓝色的海水像一场缓慢的呼吸，发光的生灵在光束间轻轻游动。请把烦恼留在岸边，让想象潜入更深的地方。" },
    { name: "云端之境", en: "CLOUD NINE", label: "ABOVE THE CLOUDS", image: "assets/images/exhibit-cloud.jpg", description: "云海之上，远山和宫殿被晚霞镀上一层柔光。向前一步，就像走进一幅还没有画完的梦。" }
  ];
  let currentScene = 0;
  let audioContext = null, masterGain = null, oscillators = [], audioEnabled = false;
  let toastTimer;

  // Generate subtle stars and drifting petals with CSS-only animation.
  const starHost = $("stars");
  for (let i = 0; i < 70; i++) {
    const star = document.createElement("i");
    star.className = "star-dot";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--dur", `${2.4 + Math.random() * 4.5}s`);
    star.style.setProperty("--delay", `${Math.random() * 5}s`);
    star.style.opacity = `${0.25 + Math.random() * 0.6}`;
    starHost.appendChild(star);
  }
  const petalHost = $("petals");
  for (let i = 0; i < 22; i++) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--fall", `${10 + Math.random() * 14}s`);
    petal.style.setProperty("--delay", `${-Math.random() * 20}s`);
    petal.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
    petal.style.opacity = `${0.3 + Math.random() * 0.55}`;
    petalHost.appendChild(petal);
  }

  // Modal exhibition viewer.
  const modal = $("sceneModal");
  function showScene(index) {
    currentScene = (index + scenes.length) % scenes.length;
    const scene = scenes[currentScene];
    $("modalImage").style.backgroundImage = `url('${scene.image}')`;
    $("modalArtLabel").textContent = scene.label;
    $("modalEn").textContent = scene.en;
    $("modalTitle").textContent = scene.name;
    $("modalDescription").textContent = scene.description;
    $("modalCount").textContent = `${String(currentScene + 1).padStart(2, "0")} / 04`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    $("modalClose").focus();
  }
  function closeScene() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }
  document.querySelectorAll(".gallery-card").forEach(card => {
    card.addEventListener("click", () => showScene(Number(card.dataset.scene)));
  });
  $("modalClose").addEventListener("click", closeScene);
  $("modalBackdrop").addEventListener("click", closeScene);
  $("modalPrev").addEventListener("click", () => showScene(currentScene - 1));
  $("modalNext").addEventListener("click", () => showScene(currentScene + 1));
  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("open")) return;
    if (event.key === "Escape") closeScene();
    if (event.key === "ArrowLeft") showScene(currentScene - 1);
    if (event.key === "ArrowRight") showScene(currentScene + 1);
  });

  // Smoothly take visitors from the intro to the exhibition cards.
  $("enterGallery").addEventListener("click", () => {
    $("exhibitions").scrollIntoView({ behavior: "smooth" });
    showToast("欢迎来到梦境展厅 ✧");
  });

  // Mobile navigation.
  $("mobileMenu").addEventListener("click", () => {
    const nav = $("mainNav");
    nav.classList.toggle("open");
    $("mobileMenu").setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });
  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => $("mainNav").classList.remove("open"));
  });

  // Fullscreen is optional; unsupported browsers receive a friendly fallback.
  $("fullscreenButton").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      showToast("当前浏览器不支持全屏，请使用浏览器菜单切换 ✧");
    }
  });

  // A soft, original ambient pad generated with Web Audio (no external music file).
  async function startAmbient() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("Web Audio unavailable");
    if (!audioContext) {
      audioContext = new AudioCtx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.045;
      masterGain.connect(audioContext.destination);
      [110, 164.81, 220.0].forEach((frequency, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        osc.type = index === 1 ? "triangle" : "sine";
        osc.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.26 : 0.12;
        filter.type = "lowpass";
        filter.frequency.value = 520;
        osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
        osc.start(); oscillators.push(osc);
      });
    }
    await audioContext.resume();
    audioEnabled = true;
    $("soundToggle").setAttribute("aria-pressed", "true");
    $("soundLabel").textContent = "音乐已开启";
    $("soundState").textContent = "ON";
  }
  async function stopAmbient() {
    if (audioContext) await audioContext.suspend();
    audioEnabled = false;
    $("soundToggle").setAttribute("aria-pressed", "false");
    $("soundLabel").textContent = "氛围音乐";
    $("soundState").textContent = "OFF";
  }
  $("soundToggle").addEventListener("click", async () => {
    try {
      if (audioEnabled) await stopAmbient();
      else await startAmbient();
    } catch (_) {
      showToast("当前浏览器暂不支持氛围音乐");
    }
  });

  // Parallax on desktop only; keeps mobile scrolling light.
  const hero = $("heroArt");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", event => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      hero.style.transform = `scale(1.055) translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

  // Reveal cards as they enter the viewport and set a compact header after scrolling.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    revealObserver.observe(el);
  });
  const header = document.querySelector(".topbar");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 35), { passive: true });

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // ===== 隐藏彩蛋：紫菱专属梦境（手动触发） =====
  const eggCard = $("eggCard");
  const eggOverlay = document.createElement("div");
  eggOverlay.className = "egg-overlay";
  eggOverlay.innerHTML = `
    <div class="egg-card">
      <span class="egg-heart">💜</span>
      <h3>紫菱，这是只属于你的梦</h3>
      <p>你长得漂亮又好看，眼睛里像藏着星星，<br>怎么看都让人心动。</p>
      <p>愿你天天都有好心情，永远开开心心；<br>你可是 <b>lw 最爱的老婆大人</b> 💖</p>
      <div class="egg-sign">FOR MY LOVE ZILING · 2010.03.20</div>
      <button type="button" id="eggClose">好，我收下啦 ✧</button>
    </div>`;
  document.body.appendChild(eggOverlay);

  function eggRains() {
    const layer = document.createElement("div");
    layer.className = "egg-layer";
    document.body.appendChild(layer);
    const hearts = ["💜", "💕", "🌸", "💖", "✨", "🌷", "💗"];
    for (let i = 0; i < 32; i++) {
      const h = document.createElement("i");
      h.textContent = hearts[i % hearts.length];
      h.style.left = `${Math.random() * 100}%`;
      h.style.fontSize = `${16 + Math.random() * 22}px`;
      h.style.animationDuration = `${3.5 + Math.random() * 3.5}s`;
      h.style.animationDelay = `${Math.random() * 2.5}s`;
      layer.appendChild(h);
    }
    setTimeout(() => layer.remove(), 9000);
  }
  function triggerEgg() {
    if (eggOverlay.classList.contains("show")) return;
    eggOverlay.classList.add("show");
    eggRains();
    showToast("✨ 这份藏了很久的心意，终于被你发现啦");
  }
  eggOverlay.querySelector("#eggClose").addEventListener("click", () => eggOverlay.classList.remove("show"));
  eggOverlay.addEventListener("click", (e) => { if (e.target === eggOverlay) eggOverlay.classList.remove("show"); });

  // 手动暗号：1.5 秒内连点 3 次「每一场梦，都值得被认真看见」两侧的小星星 ✦
  let starClicks = 0, starTimer;
  function unlockEggCard() {
    if (eggCard.classList.contains("unlocked")) return;
    eggCard.hidden = false;
    eggCard.classList.add("unlocked");
    showToast("✦ 悄悄为你留了一扇小门，推开看看");
  }
  document.querySelectorAll(".gallery-foot span").forEach(star => {
    star.addEventListener("click", () => {
      starClicks++;
      clearTimeout(starTimer);
      starTimer = setTimeout(() => (starClicks = 0), 1500);
      if (starClicks >= 3) { starClicks = 0; unlockEggCard(); }
    });
  });
  // 点击隐藏卡片，打开专属告白
  eggCard.addEventListener("click", triggerEgg);

  // ===== 体验升级：进度条 / 回顶 / 鼠标光晕 / 计数 / 小测试 / 许愿池 =====
  const progress = $("scrollProgress"), backTop = $("backTop");
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    backTop.classList.toggle("show", window.scrollY > 500);
    const hp = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    document.documentElement.style.setProperty("--scrollHp", hp);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const glow = $("cursorGlow");
    document.body.classList.add("has-cursor");
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function glowLoop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
      requestAnimationFrame(glowLoop);
    })();
  }

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = Number(el.dataset.count), suffix = el.dataset.suffix || "";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = target + suffix;
        countObserver.unobserve(el);
        return;
      }
      const start = performance.now();
      (function tick(now) {
        const p = Math.min(1, (now - start) / 1200);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".stat-num").forEach(el => countObserver.observe(el));

  const quizData = [
    { q: "今晚的心情，更接近哪一种？", options: [["想被温柔包围", 0], ["想安静地待一会儿", 1], ["想逃去很远的地方", 2], ["想轻飘飘地飞起来", 3]] },
    { q: "挑一种你此刻喜欢的颜色？", options: [["樱花粉", 0], ["月光白", 1], ["深海蓝", 2], ["晚霞橙", 3]] },
    { q: "你更想听见什么声音？", options: [["风穿过花枝", 0], ["夜虫与湖水", 1], ["海浪与鲸歌", 2], ["云雀和风铃", 3]] }
  ];
  let quizIndex = 0, quizVotes = [0, 0, 0, 0];
  const quizStep = $("quizStep"), quizBar = $("quizBar");
  function renderQuiz() {
    quizBar.style.width = `${(quizIndex / quizData.length) * 100}%`;
    if (quizIndex < quizData.length) {
      const item = quizData[quizIndex];
      quizStep.innerHTML = `<h3 class="quiz-question">${item.q}</h3><div class="quiz-options">${item.options.map(o => `<button class="quiz-option" data-vote="${o[1]}" type="button">${o[0]}</button>`).join("")}</div>`;
      quizStep.querySelectorAll(".quiz-option").forEach(btn => btn.addEventListener("click", () => {
        quizVotes[Number(btn.dataset.vote)]++;
        quizIndex++;
        renderQuiz();
      }));
    } else {
      quizBar.style.width = "100%";
      let best = 0;
      quizVotes.forEach((v, i) => { if (v > quizVotes[best]) best = i; });
      const scene = scenes[best];
      quizStep.innerHTML = `<div class="quiz-result"><div class="qr-icon">✧</div><h3>${scene.name}</h3><p>${scene.description}</p><div class="quiz-actions"><button class="quiz-primary" id="quizEnter" type="button">进入这场梦</button><button class="quiz-ghost" id="quizRetry" type="button">重新测一次</button></div>`;
      $("quizEnter").addEventListener("click", () => showScene(best));
      $("quizRetry").addEventListener("click", () => { quizIndex = 0; quizVotes = [0, 0, 0, 0]; renderQuiz(); });
    }
  }
  renderQuiz();

  const wishInput = $("wishInput"), wishList = $("wishList"), wishEmpty = $("wishEmpty");
  let wishes = [];
  try { wishes = JSON.parse(localStorage.getItem("dream_gallery_wishes") || "[]"); } catch (_) { wishes = []; }
  function escapeHtml(str) { return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function saveWishes() { try { localStorage.setItem("dream_gallery_wishes", JSON.stringify(wishes)); } catch (_) {} }
  function renderWishes() {
    wishList.innerHTML = wishes.map((w, i) => `<div class="wish-item"><button class="wish-del" data-i="${i}" type="button" aria-label="删除愿望">×</button><p>${escapeHtml(w.text)}</p><small>${w.time}</small></div>`).join("");
    wishEmpty.style.display = wishes.length ? "none" : "block";
    wishList.querySelectorAll(".wish-del").forEach(btn => btn.addEventListener("click", () => {
      wishes.splice(Number(btn.dataset.i), 1);
      saveWishes(); renderWishes();
    }));
  }
  function addWish() {
    const text = wishInput.value.trim();
    if (!text) { showToast("先写点什么再许愿吧"); return; }
    const now = new Date();
    const time = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    wishes.unshift({ text, time });
    wishInput.value = "";
    saveWishes(); renderWishes();
    showToast("✦ 星星已经替你收下啦");
  }
  $("wishSend").addEventListener("click", addWish);
  wishInput.addEventListener("keydown", e => { if (e.key === "Enter") addWish(); });
  renderWishes();

  // ===== 2.0 升级：Canvas 星空 / 打字机 / 3D tilt / 今日签 / 接星星 =====
  const isMobileView = window.matchMedia("(max-width:600px)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const starCanvas = $("starCanvas");
  let sctx = null, SW = 0, SH = 0, DPR = 1, spts = [], smouse = { x: -999, y: -999 };
  const tapBursts = [];
  try {
    sctx = starCanvas.getContext("2d");
    function initStars() {
      DPR = Math.min(window.devicePixelRatio || 1, 2.5);
      SW = window.innerWidth;
      SH = window.innerHeight;
      starCanvas.width = Math.floor(SW * DPR);
      starCanvas.height = Math.floor(SH * DPR);
      sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = isMobileView ? 34 : 58;
      spts = [];
      for (let i = 0; i < n; i++) spts.push({
        x: Math.random() * SW, y: Math.random() * SH,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: isMobileView ? Math.random() * 1.8 + 0.9 : Math.random() * 1.6 + 0.5
      });
    }
    function starFrame() {
      sctx.clearRect(0, 0, SW, SH);
      for (const p of spts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = SW; if (p.x > SW) p.x = 0; if (p.y < 0) p.y = SH; if (p.y > SH) p.y = 0;
        sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, 7);
        sctx.fillStyle = isMobileView ? "rgba(255,214,238,.95)" : "rgba(244,196,223,.85)";
        sctx.fill();
        const d = Math.hypot(p.x - smouse.x, p.y - smouse.y);
        if (d < 140) { sctx.beginPath(); sctx.moveTo(p.x, p.y); sctx.lineTo(smouse.x, smouse.y); sctx.strokeStyle = `rgba(244,168,211,${0.35 * (1 - d / 140)})`; sctx.stroke(); }
      }
      for (let i = 0; i < spts.length; i++) {
        for (let j = i + 1; j < spts.length; j++) {
          const a = spts[i], b = spts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) { sctx.beginPath(); sctx.moveTo(a.x, a.y); sctx.lineTo(b.x, b.y); sctx.strokeStyle = `rgba(178,80,181,${0.22 * (1 - d / 110)})`; sctx.stroke(); }
        }
      }
      for (let i = tapBursts.length - 1; i >= 0; i--) {
        const b = tapBursts[i];
        sctx.beginPath(); sctx.arc(b.x, b.y, 6 + (1 - b.life) * 26, 0, 7);
        sctx.strokeStyle = `rgba(255,214,238,${b.life * 0.8})`; sctx.lineWidth = 1.5; sctx.stroke();
        sctx.beginPath(); sctx.arc(b.x, b.y, 2.2, 0, 7); sctx.fillStyle = `rgba(255,235,246,${b.life})`; sctx.fill();
        b.life -= 0.035;
        if (b.life <= 0) tapBursts.splice(i, 1);
      }
    }
    function starLoop() { starFrame(); requestAnimationFrame(starLoop); }
    function handleResize() {
      initStars();
      if (reduceMotion) starFrame();
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    window.addEventListener("pointermove", e => { smouse.x = e.clientX; smouse.y = e.clientY; }, { passive: true });
    document.addEventListener("pointerdown", e => {
      if (e.pointerType !== "touch") return;
      if (/button|a|input|select|textarea|label/i.test(e.target.tagName)) return;
      tapBursts.push({ x: e.clientX, y: e.clientY, life: 1 });
    }, { passive: true });
    initStars();
    if (reduceMotion) starFrame(); else starLoop();
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", e => {
      if (e.matches) starFrame();
    });
  } catch (err) {
    starCanvas.style.display = "none";
  }

  // Hero 打字机轮播
  const phrases = ["这里，收藏着所有关于美好的想象。", "愿你在每一束光里，遇见心中柔软的风景。", "把心交给一场梦，慢慢走，慢慢看。"];
  const typingEl = $("heroTyping");
  let phraseI = 0, charI = 0, deleting = false;
  function typeLoop() {
    if (reduceMotion) { typingEl.textContent = phrases[0]; return; }
    const full = phrases[phraseI];
    if (deleting) {
      charI--; typingEl.textContent = full.slice(0, charI);
      if (charI === 0) { deleting = false; phraseI = (phraseI + 1) % phrases.length; setTimeout(typeLoop, 350); return; }
    } else {
      charI++; typingEl.textContent = full.slice(0, charI);
      if (charI === full.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
    }
    setTimeout(typeLoop, deleting ? 60 : 110);
  }
  typeLoop();

  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".gallery-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const rc = card.getBoundingClientRect();
        const px = (e.clientX - rc.left) / rc.width - 0.5, py = (e.clientY - rc.top) / rc.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  function renderDaily() {
    const now = new Date();
    const seed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 40 + now.getDate();
    const score = 62 + seed % 36;
    const verses = ["今天适合把烦心事交给风，留一颗糖给自己。", "你会在不经意的瞬间，遇见让你嘴角上扬的小事。", "把脚步放慢一点，好运正在赶来的路上。", "今晚的梦会很温柔，记得早点睡。", "主动一点也没关系，你值得被认真回应。", "把喜欢的事安排上，今天会过得闪闪发光。", "一场安静的散步，就能替你充满电。", "别担心，你担心的事正在慢慢变好。"];
    const colors = [["#b250b5", "梦境紫"], ["#f4a8d3", "樱花粉"], ["#7fb4e8", "天空蓝"], ["#f4d7bd", "暖杏色"], ["#9fd8c4", "薄荷绿"], ["#f4c46a", "星光金"]];
    const good = ["听音乐", "慢慢散步", "看云发呆", "吃点甜的", "早点睡觉", "拍好看的照片", "喝杯热饮", "读几页书"];
    const bad = ["胡思乱想", "熬到很晚", "一个人硬扛", "不吃饭", "反复内耗"];
    const c = colors[seed % colors.length];
    $("dailyCard").innerHTML = `<div class="daily-date">${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日</div>
      <div class="daily-score"><b>${score}</b><small>梦境指数</small></div>
      <p class="daily-verse">「${verses[seed % verses.length]}」</p>
      <div class="daily-color"><i style="background:${c[0]}"></i>今日守护色：${c[1]}</div>
      <div class="daily-tags"><span class="good">宜 ${good[seed % good.length]}</span><span class="good">宜 ${good[(seed + 3) % good.length]}</span><span class="bad">忌 ${bad[seed % bad.length]}</span><span class="bad">忌 ${bad[(seed + 2) % bad.length]}</span></div>`;
  }
  renderDaily();

  let gameRunning = false, gameLeft = 30, gameScoreVal = 0, gameCountTimer = null, spawnTimer = null;
  const gameArea = $("gameArea");
  function spawnStar() {
    const s = document.createElement("span");
    s.className = "game-star"; s.textContent = "✦";
    s.style.left = `${Math.random() * Math.max(10, gameArea.clientWidth - 34)}px`;
    s.style.top = "-34px";
    const dur = Math.max(1.8, 2.8 + Math.random() * 1.6 - (30 - gameLeft) * 0.02);
    s.style.transition = `top ${dur}s linear`;
    s.addEventListener("click", () => { if (!gameRunning) return; gameScoreVal++; $("gameScore").textContent = gameScoreVal; s.remove(); });
    gameArea.appendChild(s);
    requestAnimationFrame(() => { s.style.top = `${gameArea.clientHeight}px`; });
    setTimeout(() => s.remove(), dur * 1000 + 200);
  }
  function endGame() {
    gameRunning = false;
    clearInterval(gameCountTimer); clearInterval(spawnTimer);
    let rating;
    if (gameScoreVal >= 22) rating = "星光璀璨，今天手气爆棚！";
    else if (gameScoreVal >= 14) rating = "不错哦，被你接住了一大把好运。";
    else if (gameScoreVal >= 7) rating = "就当热身，明天再来一局。";
    else rating = "星星有点调皮，别灰心呀。";
    $("gameTip").textContent = `时间到！你点亮了 ${gameScoreVal} 颗星星。${rating}`;
    $("gameStart").textContent = "再来一局";
    gameArea.innerHTML = "";
  }
  $("gameStart").addEventListener("click", () => {
    if (gameRunning) return;
    gameRunning = true; gameLeft = 30; gameScoreVal = 0;
    $("gameScore").textContent = "0"; $("gameTimer").textContent = "30";
    $("gameTip").textContent = "星星来啦，快点点它们！";
    $("gameStart").textContent = "进行中";
    gameArea.innerHTML = "";
    spawnTimer = setInterval(spawnStar, 650);
    gameCountTimer = setInterval(() => {
      gameLeft--; $("gameTimer").textContent = gameLeft;
      if (gameLeft <= 0) endGame();
    }, 1000);
  });

  // 横屏旋转提示（仅触屏竖屏）
  const rotateHint = $("rotateHint");
  const isTouchDevice = window.matchMedia("(pointer:coarse)").matches;
  let rotateDismissed = false;
  try { rotateDismissed = sessionStorage.getItem("dream_gallery_rotate_dismissed") === "1"; } catch (e) {}
  function isPortrait() { return window.matchMedia("(orientation:portrait)").matches; }
  if (isTouchDevice && !rotateDismissed) {
    setTimeout(() => { if (isPortrait()) rotateHint.classList.add("show"); }, 2600);
  }
  $("rotateClose").addEventListener("click", () => {
    rotateHint.classList.remove("show");
    rotateDismissed = true;
    try { sessionStorage.setItem("dream_gallery_rotate_dismissed", "1"); } catch (e) {}
  });
  function syncRotateHint() {
    if (!isPortrait()) rotateHint.classList.remove("show");
    else if (!rotateDismissed) rotateHint.classList.add("show");
  }
  window.addEventListener("orientationchange", syncRotateHint);
  window.addEventListener("resize", syncRotateHint);
})();
