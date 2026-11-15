/* WELIX — visual effects: boot screen, ECG line, DNA helix, background field, code stream.
 * Pure decoration: nothing here is presented as data. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const rnd = (a, b) => a + Math.random() * (b - a);
  const hex = (n) => Array.from({ length: n }, () => "0123456789ABCDEF"[(Math.random() * 16) | 0]).join("");
  const pick = (a) => a[(Math.random() * a.length) | 0];

  function fit(c) {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect();
    c.width = Math.max(1, r.width * dpr); c.height = Math.max(1, r.height * dpr);
    const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { x, w: r.width, h: r.height };
  }

  const FX = {
    /** Boot sequence overlay (once per session). */
    boot(lines) {
      const CFG = window.WELIX_CONFIG;
      if (!CFG.bootSequence || reduce) return;
      try { if (sessionStorage.getItem("welix.booted")) return; sessionStorage.setItem("welix.booted", "1"); } catch {}
      const o = document.createElement("div");
      o.className = "boot";
      o.innerHTML = `<div class="boot-in"><img src="assets/brand/welix-mark.svg" alt="" width="72" height="72"><pre id="boot-log"></pre><div class="boot-bar"><i></i></div><small>CLICK TO SKIP</small></div>`;
      document.body.appendChild(o);
      const log = o.querySelector("#boot-log");
      let i = 0;
      const done = () => { o.classList.add("out"); setTimeout(() => o.remove(), 600); };
      o.addEventListener("click", done);
      const step = () => {
        if (i >= lines.length) return setTimeout(done, 350);
        log.textContent += lines[i++] + "\n";
        o.querySelector(".boot-bar i").style.width = (i / lines.length) * 100 + "%";
        setTimeout(step, rnd(90, 190));
      };
      step();
    },

    /** Heartbeat line under the header. */
    ecg(c) {
      if (!c) return;
      let { x, w, h } = fit(c), t = 0, pts = [];
      addEventListener("resize", () => ({ x, w, h } = fit(c)));
      const beat = (p) => {
        p %= 1;
        if (p < .40) return 0; if (p < .44) return -.15; if (p < .47) return .1;
        if (p < .50) return -1; if (p < .53) return .55; if (p < .58) return 0;
        if (p < .68) return -.22 * Math.sin((p - .58) / .1 * Math.PI); return 0;
      };
      const draw = () => {
        t += 1.4;
        pts.push(beat(t / 220));
        if (pts.length > w / 2) pts.shift();
        x.clearRect(0, 0, w, h);
        x.lineWidth = 1.4; x.strokeStyle = css("--accent"); x.shadowColor = css("--accent"); x.shadowBlur = 6;
        x.beginPath();
        pts.forEach((v, i) => { const px = i * 2, py = h / 2 + v * (h / 2 - 2); i ? x.lineTo(px, py) : x.moveTo(px, py); });
        x.stroke();
        if (!reduce) requestAnimationFrame(draw);
      };
      draw();
    },

    /** Rotating double helix. */
    dna(c) {
      if (!c) return;
      let { x, w, h } = fit(c), t = 0;
      addEventListener("resize", () => ({ x, w, h } = fit(c)));
      const A = css("--amber"), B = css("--blue");
      const draw = () => {
        t += .022;
        x.clearRect(0, 0, w, h);
        const n = 26, amp = Math.min(w * .32, 70), cx = w / 2;
        for (let i = 0; i < n; i++) {
          const y = 14 + (h - 28) * (i / (n - 1)), ph = i * .42 + t;
          const xa = cx + Math.sin(ph) * amp, xb = cx + Math.sin(ph + Math.PI) * amp;
          const za = (Math.cos(ph) + 1) / 2, zb = 1 - za;
          x.strokeStyle = `rgba(150,180,200,${.12 + .25 * Math.abs(Math.cos(ph))})`;
          x.lineWidth = 1; x.beginPath(); x.moveTo(xa, y); x.lineTo(xb, y); x.stroke();
          x.fillStyle = A; x.globalAlpha = .35 + .65 * za; x.beginPath(); x.arc(xa, y, 2 + 2.5 * za, 0, 7); x.fill();
          x.fillStyle = B; x.globalAlpha = .35 + .65 * zb; x.beginPath(); x.arc(xb, y, 2 + 2.5 * zb, 0, 7); x.fill();
          x.globalAlpha = 1;
        }
        if (!reduce) requestAnimationFrame(draw);
      };
      draw();
    },

    /** Background: perspective grid + drifting particles. */
    field(c) {
      if (!c) return;
      let { x, w, h } = fit(c), t = 0;
      addEventListener("resize", () => ({ x, w, h } = fit(c)));
      const P = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(.0002, .0009), a: Math.random() < .3 }));
      const draw = () => {
        t += 1;
        x.clearRect(0, 0, w, h);
        const hz = h * .62;
        x.strokeStyle = "rgba(0,225,255,.07)"; x.lineWidth = 1;
        for (let i = -20; i <= 20; i++) { x.beginPath(); x.moveTo(w / 2 + i * 30, hz); x.lineTo(w / 2 + i * 160, h); x.stroke(); }
        for (let j = 0; j < 14; j++) {
          const p = ((j + (t % 60) / 60) / 14) ** 2, y = hz + (h - hz) * p;
          x.globalAlpha = p; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
        }
        x.globalAlpha = 1;
        for (const p of P) {
          p.y -= p.v; if (p.y < 0) { p.y = 1; p.x = Math.random(); }
          x.fillStyle = p.a ? "rgba(255,176,0,.55)" : "rgba(0,225,255,.45)";
          x.fillRect(p.x * w, p.y * h, 1.6, 1.6);
        }
        if (!reduce) requestAnimationFrame(draw);
      };
      draw();
    },

    /** Endless decorative code stream. `push(line, cls)` lets real logs join the stream. */
    stream(el, max = 40) {
      if (!el) return { push() {} };
      const sys = window.WELIX_CONFIG.project.systemId;
      const T = [
        () => `[${sys}] neural.triage --scan sector=${hex(4)} :: OK`,
        () => `helix.seq --read 0x${hex(8)} → ${pick(["A-T", "G-C", "T-A", "C-G"])} pair locked`,
        () => `cortex::infer(model="WELIX-v${(Math.random() * 9).toFixed(1)}") → confidence ${pick(["HIGH", "NOMINAL", "STABLE"])}`,
        () => `nano.courier dispatch #${hex(5)} → ward ${pick(["S", "R", "B", "N"])}`,
        () => `cryo.ledger commit ${hex(12).toLowerCase()} ✓`,
        () => `bio.sync handshake 0x${hex(6)} … ${pick(["accepted", "verified", "sealed"])}`,
        () => `holo.render layer=${pick(["skeletal", "vascular", "neural", "genomic"])} fps=${pick([60, 90, 120])}`,
        () => `> immune.firewall: ${pick(["no anomalies", "threat neutralised", "perimeter clean"])}`,
        () => `med.ai.core :: pulse ${pick(["▁▃▅▇▅▃▁", "▂▄▆█▆▄▂", "▁▂▅█▅▂▁"])}`,
      ];
      const push = (line, cls = "") => {
        const d = document.createElement("div");
        d.className = "ln " + cls; d.textContent = line;
        el.appendChild(d);
        while (el.children.length > max) el.firstChild.remove();
      };
      if (!reduce) (function loop() { push(pick(T)()); setTimeout(loop, rnd(160, 520)); })();
      else for (let i = 0; i < 12; i++) push(pick(T)());
      return { push };
    },

    /** Text scramble reveal for [data-scramble]. */
    scramble(root = document) {
      if (reduce) return;
      const chars = "!<>-_\\/[]{}—=+*^?#01";
      root.querySelectorAll("[data-scramble]").forEach((el) => {
        const final = el.textContent; let f = 0;
        const tick = () => {
          f++;
          el.textContent = final.split("").map((ch, i) => (i < f / 2 || ch === " " ? ch : pick(chars))).join("");
          if (f / 2 < final.length) requestAnimationFrame(tick);
        };
        tick();
      });
    },

    /** Reveal-on-scroll. */
    reveal() {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); } }), { threshold: .12 });
      document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    },
  };

  window.FX = FX;
})();
