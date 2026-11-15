/* WELIX — shared UI: theme, header, footer, CA blocks, wallet modal, toasts. */
(function () {
  const CFG = window.WELIX_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), CFG);

  const ICONS = {
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.8-6.3L5.4 21H2.3l7.2-8.3L2 3h6.3l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2 1.8 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M6 6l10-3 1 3"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  const UI = {
    $, esc, get, ICONS,
    sym() { return "$" + CFG.token.symbol; },
    short(a, n = 4) { return a ? (a.length > 2 * n + 3 ? a.slice(0, n + 2) + "…" + a.slice(-n) : a) : ""; },
    num(v, max = 2) {
      if (v == null || v === "") return "—";
      const x = Number(v);
      if (!isFinite(x)) return String(v);
      return x.toLocaleString("en-US", { maximumFractionDigits: max });
    },
    compact(v) {
      const x = Number(v);
      if (!isFinite(x)) return "—";
      return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(x);
    },
    netIcon(n, cls = "net-ic") { return `<img class="${cls}" src="${esc(n.icon)}" alt="${esc(n.name)}" title="${esc(n.name)}" width="20" height="20">`; },
    hexToRgb(h) { const m = h.replace("#", ""); const v = parseInt(m.length === 3 ? m.replace(/./g, "$&$&") : m, 16); return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`; },

    /** Theme: single mode adopts the network's colors; multi keeps WELIX amber/electric blue. */
    applyTheme() {
      const root = document.documentElement;
      root.dataset.mode = Chain.isSingle() ? "single" : "multi";
      const n = Chain.get(Chain.primaryId());
      root.dataset.net = Chain.isSingle() ? n.id : "multi";
      if (Chain.isSingle()) {
        root.style.setProperty("--net", n.color);
        root.style.setProperty("--net-rgb", UI.hexToRgb(n.color));
        root.style.setProperty("--net2", n.color2 || n.color);
      }
    },

    /** Fill every [data-cfg="path"] element with its config value. */
    bindText(root = document) {
      root.querySelectorAll("[data-cfg]").forEach((el) => {
        const v = get(el.dataset.cfg);
        if (v != null) el.textContent = el.dataset.cfgPrefix ? el.dataset.cfgPrefix + v : v;
      });
      root.querySelectorAll("[data-sym]").forEach((el) => (el.textContent = UI.sym()));
    },

    socials(cls = "") {
      const s = CFG.social, out = [];
      if (s.x) out.push(`<a class="soc ${cls}" href="${esc(s.x)}" target="_blank" rel="noopener" aria-label="X">${ICONS.x}<span>${esc(s.xHandle || "X")}</span></a>`);
      if (s.telegram) out.push(`<a class="soc ${cls}" href="${esc(s.telegram)}" target="_blank" rel="noopener" aria-label="Telegram">${ICONS.tg}<span>${esc(s.telegramHandle || "Telegram")}</span></a>`);
      return out.join("");
    },

    header(page) {
      const el = $("#site-header");
      if (!el) return;
      const nav = page === "docs"
        ? [["index.html", "Terminal"], ["#overview", "Overview"], ["#networks", "Networks"], ["#faq", "FAQ"]]
        : [["#about", "About"], ["#ecosystem", "Ecosystem"], ["#vision", "Vision"], ["#vitals", "Network"], ["#plan", "Plan"], ["docs.html", "Docs"]];
      el.innerHTML = `
        <div class="hdr-in">
          <a class="brand" href="index.html" aria-label="${esc(CFG.project.name)} home">
            <img src="assets/brand/welix-mark.svg" alt="" width="36" height="36">
            <span class="brand-t"><b>${esc(CFG.project.name)}</b><small>${esc(CFG.project.systemId)}</small></span>
          </a>
          <nav class="nav" id="nav">${nav.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
          <div class="hdr-r">
            <div class="ca-chips" id="hdr-ca"></div>
            <span class="hdr-soc">${UI.socials("mini")}</span>
            <button class="btn btn-wallet" id="btn-wallet">${ICONS.wallet}<span>Connect</span></button>
            <button class="burger" id="burger" aria-label="Menu"><i></i><i></i><i></i></button>
          </div>
        </div>
        <canvas class="ecg" id="ecg" aria-hidden="true"></canvas>`;
      $("#burger").onclick = () => document.body.classList.toggle("nav-open");
      $("#nav").addEventListener("click", () => document.body.classList.remove("nav-open"));
      $("#btn-wallet").onclick = () => UI.openWallet();
      UI.renderHeaderCA();
      UI.renderWalletBtn();
    },

    renderHeaderCA() {
      const el = $("#hdr-ca");
      if (!el) return;
      el.innerHTML = Chain.caGroups().map((g) => `
        <button class="ca-chip" ${g.ca ? `data-copy="${esc(g.ca)}"` : "disabled"} title="${g.ca ? "Copy CA" : "CA will be announced on X"}">
          <span class="ic-stack">${g.nets.map((n) => UI.netIcon(n)).join("")}</span>
          <code>${g.ca ? esc(UI.short(g.ca)) : "CA · SOON"}</code>${g.ca ? ICONS.copy : ""}
        </button>`).join("");
    },

    /** Full CA panel: one row per CA group, network SVGs, Copy CA, explorer links. */
    caBlock(el) {
      if (!el) return;
      el.innerHTML = Chain.caGroups().map((g) => `
        <div class="ca-row ${g.ca ? "" : "pending"}">
          <div class="ca-nets">
            <span class="ic-stack lg">${g.nets.map((n) => UI.netIcon(n)).join("")}</span>
            <span class="ca-lbl">${g.nets.map((n) => esc(n.short)).join(" · ")}<small>${g.nets.length > 1 ? "Shared EVM contract" : esc(g.nets[0].name)}</small></span>
          </div>
          <code class="ca-addr">${g.ca ? esc(g.ca) : "Awaiting deployment — announced on " + esc(CFG.social.xHandle || "X")}</code>
          <div class="ca-act">
            <button class="btn btn-copy" ${g.ca ? `data-copy="${esc(g.ca)}"` : "disabled"}>${ICONS.copy}<span>Copy CA</span></button>
            ${g.ca ? g.nets.map((n) => `<a class="btn-ic" href="${esc(Chain.explorerToken(n.id))}" target="_blank" rel="noopener" title="View on ${esc(n.name)} explorer">${UI.netIcon(n, "net-ic sm")}${ICONS.ext}</a>`).join("") : ""}
          </div>
        </div>`).join("");
    },

    async copy(text) {
      try { await navigator.clipboard.writeText(text); }
      catch {
        const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); } catch {} t.remove();
      }
      UI.toast("CA copied to clipboard", "ok");
    },

    toast(msg, kind = "") {
      let host = $("#toasts");
      if (!host) { host = document.createElement("div"); host.id = "toasts"; document.body.appendChild(host); }
      const t = document.createElement("div");
      t.className = "toast " + kind; t.textContent = "> " + msg;
      host.appendChild(t);
      setTimeout(() => t.classList.add("out"), 2600);
      setTimeout(() => t.remove(), 3100);
    },

    footer() {
      const el = $("#site-footer");
      if (!el) return;
      el.innerHTML = `
        <div class="ftr-in">
          <div class="ftr-brand"><img src="assets/brand/welix-lockup.svg" alt="${esc(CFG.project.name)}" height="44"></div>
          <div class="ftr-links">
            <a href="index.html">Terminal</a><a href="docs.html">Docs</a><a href="docs.html#brand">Brand kit</a>${UI.socials()}
          </div>
          <p class="disc">${esc(CFG.project.name)} — ${esc(CFG.project.signature || "")}</p>
          <p class="disc">${esc(UI.sym())} is the community token of the ${esc(CFG.project.name)} ecosystem. ${esc(CFG.project.name)} provides wellness insights only —
          not medical advice, diagnosis or treatment, and not financial advice. Always verify the CA from official channels.</p>
          <p class="copy-r">© ${new Date().getFullYear()} ${esc(CFG.project.name)} · ${esc(CFG.project.systemId)} · ${esc(CFG.project.motto || "")}</p>
        </div>`;
    },

    /* ---------------- Wallet ---------------- */
    renderWalletBtn() {
      const b = $("#btn-wallet");
      if (!b) return;
      const s = Wallet.state;
      if (s.connected) {
        const n = s.network && Chain.get(s.network);
        b.classList.add("on");
        b.innerHTML = `${n ? UI.netIcon(n, "net-ic sm") : ICONS.wallet}<span>${esc(UI.short(s.address))}</span>`;
      } else {
        b.classList.remove("on");
        b.innerHTML = `${ICONS.wallet}<span>Connect</span>`;
      }
    },

    modal(html) {
      UI.closeModal();
      const m = document.createElement("div");
      m.className = "modal"; m.id = "modal";
      m.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-box holo" role="dialog" aria-modal="true">
        <button class="modal-x" data-close aria-label="Close">${ICONS.close}</button>${html}</div>`;
      m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) UI.closeModal(); });
      document.body.appendChild(m);
      requestAnimationFrame(() => m.classList.add("in"));
      return m;
    },
    closeModal() { $("#modal")?.remove(); },

    openWallet(step, netId) {
      const s = Wallet.state;
      if (s.connected && !step) return UI.walletInfo();
      const nets = Chain.list();
      if (!netId && nets.length === 1) netId = nets[0].id;
      if (!netId) {
        const m = UI.modal(`<div class="m-head"><span class="tag">AUTH // 01</span><h3>Select network</h3><p>Choose which ward to log in to.</p></div>
          <div class="m-list">${nets.map((n) => `<button class="m-item" data-net="${n.id}" style="--c:${n.color}">${UI.netIcon(n, "net-ic lg")}<span><b>${esc(n.name)}</b><small>${esc(n.ward)}</small></span></button>`).join("")}</div>`);
        m.querySelectorAll("[data-net]").forEach((b) => (b.onclick = () => UI.openWallet("wallets", b.dataset.net)));
        return;
      }
      const n = Chain.get(netId);
      let items;
      if (n.type === "solana") {
        items = Wallet.solWallets().map((w) => w.installed
          ? `<button class="m-item" data-w="${w.key}">${w.icon ? `<img class="net-ic lg" src="${esc(w.icon)}" alt="">` : UI.netIcon(n, "net-ic lg")}<span><b>${esc(w.name)}</b><small>Detected</small></span></button>`
          : `<a class="m-item off" href="${esc(w.url)}" target="_blank" rel="noopener">${UI.netIcon(n, "net-ic lg")}<span><b>${esc(w.name)}</b><small>Not installed — get it</small></span>${ICONS.ext}</a>`).join("");
      } else {
        const ws = Wallet.evmWallets();
        items = ws.length
          ? ws.map((w) => `<button class="m-item" data-w="${esc(w.info.rdns || "injected")}">${w.info.icon ? `<img class="net-ic lg" src="${esc(w.info.icon)}" alt="">` : UI.netIcon(n, "net-ic lg")}<span><b>${esc(w.info.name)}</b><small>Detected · switches to ${esc(n.name)}</small></span></button>`).join("")
          : Wallet.EVM_INSTALL.map((w) => `<a class="m-item off" href="${w.url}" target="_blank" rel="noopener">${UI.netIcon(n, "net-ic lg")}<span><b>${w.name}</b><small>No wallet detected — install</small></span>${ICONS.ext}</a>`).join("");
      }
      const m = UI.modal(`<div class="m-head"><span class="tag">AUTH // 02</span><h3>${UI.netIcon(n)} ${esc(n.name)}</h3><p>Pick a wallet. Login is read-only: no approvals, no transfers.</p></div>
        <div class="m-list">${items}</div>
        ${Chain.list().length > 1 ? `<button class="link-back" id="m-back">← Change network</button>` : ""}
        <p class="m-err" id="m-err"></p>`);
      m.querySelector("#m-back")?.addEventListener("click", () => UI.openWallet("nets"));
      m.querySelectorAll("[data-w]").forEach((b) => (b.onclick = async () => {
        b.classList.add("busy");
        try { await Wallet.connect(netId, b.dataset.w); UI.closeModal(); UI.toast("Identity verified · " + UI.short(Wallet.state.address), "ok"); }
        catch (e) { m.querySelector("#m-err").textContent = "ERR: " + (e.message || e); b.classList.remove("busy"); }
      }));
    },

    walletInfo() {
      const s = Wallet.state, n = s.network && Chain.get(s.network);
      const lvl = Wallet.clearance();
      const ca = n ? Chain.tokenAddress(n.id) : "";
      const m = UI.modal(`<div class="m-head"><span class="tag">PATIENT FILE</span><h3>${n ? UI.netIcon(n) : ""} ${esc(UI.short(s.address, 6))}</h3>
          <p>${esc(s.walletName || "")} · ${n ? esc(n.name) : "Unsupported network — switch in your wallet"}</p></div>
        <dl class="m-dl">
          <dt>${esc(UI.sym())} balance</dt><dd>${!ca ? "CA pending" : s.balance == null ? "Reading…" : esc(UI.num(s.balance))}</dd>
          <dt>Clearance</dt><dd>${ca && lvl && s.balance != null ? `<b class="amber">${esc(lvl.code)} ${esc(lvl.name)}</b>` : "—"}</dd>
        </dl>
        <div class="m-row">
          <button class="btn" id="m-copyaddr">${ICONS.copy}<span>Copy address</span></button>
          ${n ? `<a class="btn" href="${esc(Chain.explorerAddr(n.id, s.address))}" target="_blank" rel="noopener">${ICONS.ext}<span>Explorer</span></a>` : ""}
          <button class="btn btn-danger" id="m-dc">Disconnect</button>
        </div>`);
      m.querySelector("#m-copyaddr").onclick = () => { navigator.clipboard?.writeText(s.address); UI.toast("Address copied", "ok"); };
      m.querySelector("#m-dc").onclick = async () => { await Wallet.disconnect(); UI.closeModal(); UI.toast("Session closed"); };
    },

    init(page) {
      UI.applyTheme();
      document.title = page === "docs"
        ? `Docs — ${CFG.project.name} ($${CFG.token.symbol})`
        : `${CFG.project.name} ($${CFG.token.symbol}) — ${CFG.project.tagline}`;
      UI.header(page);
      UI.footer();
      UI.bindText();
      document.addEventListener("click", (e) => {
        const c = e.target.closest("[data-copy]");
        if (c && !c.disabled) UI.copy(c.dataset.copy);
      });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") UI.closeModal(); });
      window.addEventListener("wallet:change", () => UI.renderWalletBtn());
      Wallet.init();
    },
  };

  window.UI = UI;
})();
