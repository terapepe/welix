/* WELIX — landing page. */
(function () {
  const CFG = window.WELIX_CONFIG;
  const { $, esc } = UI;
  const nets = () => Chain.list();
  let stream;

  UI.init("home");
  const single = Chain.isSingle(), prim = Chain.get(Chain.primaryId());

  FX.boot([
    `WELIX BIOS v${CFG.project.era}.11 — ${CFG.project.systemId}`,
    "memory check ............ OK",
    "loading wellness intelligence core ............ OK",
    "syncing sleep · nutrition · fitness · recovery · mind ............ OK",
    `mounting wards: ${nets().map((n) => n.short).join(" · ")}`,
    `token ${CFG.token.name} ($${CFG.token.symbol}) ............ ${Chain.caGroups().some((g) => g.ca) ? "LINKED" : "AWAITING CA"}`,
    "immune firewall ............ ARMED",
    `> ${CFG.project.motto}`,
  ]);
  FX.field($("#field"));
  FX.ecg($("#ecg"));
  FX.dna($("#dna"));
  stream = FX.stream($("#stream"));
  FX.scramble();

  /* ---------- Hero ---------- */
  $("#hero-net").innerHTML = single
    ? `<div class="net-badge" style="--c:${prim.color}">${UI.netIcon(prim, "net-ic xl")}<span><small>DEPLOYED ON</small><b>${esc(prim.name)}</b><em>${esc(prim.ward)}</em></span></div>`
    : `<div class="net-badge multi"><span class="ic-stack lg">${nets().map((n) => UI.netIcon(n)).join("")}</span><span><small>LIVE ACROSS ${nets().length} WARDS</small><b>${nets().map((n) => esc(n.short)).join(" · ")}</b></span></div>`;
  UI.caBlock($("#hero-ca"));
  $("#hero-soc").innerHTML = UI.socials("btn");
  document.querySelectorAll('[data-action="wallet"]').forEach((b) => (b.onclick = () => UI.openWallet()));

  /* ---------- Ticker ---------- */
  const tick = [
    `${CFG.token.name} · $${CFG.token.symbol}`,
    CFG.project.tagline.toUpperCase(),
    ...(CFG.project.motto || "").split(". ").map((m) => m.replace(/\.$/, "").toUpperCase()),
    `MODE: ${single ? "SINGLE · " + prim.name.toUpperCase() : "MULTI-WARD"}`,
    ...nets().map((n) => `${n.short} :: ${n.ward.toUpperCase()}`),
    Chain.caGroups().some((g) => g.ca) ? "CA VERIFIED ON SITE" : "CA DROPS ON X — STAY TUNED",
    "READ-ONLY LOGIN · NO APPROVALS",
    CFG.social.xHandle ? "FOLLOW " + CFG.social.xHandle : "",
  ].filter(Boolean);
  const tHtml = tick.map((t) => `<span>${esc(t)}</span>`).join("<i>◆</i>");
  $("#ticker").innerHTML = tHtml + "<i>◆</i>" + tHtml + "<i>◆</i>";

  /* ---------- Vitals (live RPC) ---------- */
  $("#vitals-grid").innerHTML = nets().map((n) => `
    <div class="vital holo rv" id="v-${n.id}" style="--c:${n.color}">
      <div class="v-h">${UI.netIcon(n, "net-ic lg")}<span><b>${esc(n.name)}</b><small>${n.type === "solana" ? "Solana mainnet" : "Chain ID " + n.chainId}</small></span><em class="st">LINKING…</em></div>
      <div class="v-b">
        <div><small>${n.type === "solana" ? "SLOT" : "BLOCK"}</small><b data-k="height">—</b></div>
        <div><small>LATENCY</small><b data-k="latency">—</b></div>
        <div><small>${n.type === "solana" ? "FINALITY" : "GAS"}</small><b data-k="gas">${n.type === "solana" ? "~400 ms" : "—"}</b></div>
      </div>
      <div class="v-pulse"><i></i></div>
    </div>`).join("");

  async function pollVitals() {
    await Promise.all(nets().map(async (n) => {
      const card = $("#v-" + n.id), v = await Chain.vitals(n.id);
      card.classList.toggle("off", !v.online);
      card.querySelector(".st").textContent = v.online ? "ONLINE" : "NO SIGNAL";
      if (!v.online) { stream.push(`[RPC] ${n.short} :: no signal`, "err"); return; }
      card.querySelector('[data-k="height"]').textContent = "#" + v.height.toLocaleString("en-US");
      card.querySelector('[data-k="latency"]').textContent = v.latency + " ms";
      if (v.gas != null) card.querySelector('[data-k="gas"]').textContent = (v.gas < 1 ? v.gas.toFixed(4) : v.gas.toFixed(2)) + " gwei";
      card.classList.remove("blip"); void card.offsetWidth; card.classList.add("blip");
      stream.push(`[RPC] ${n.short} ${n.type === "solana" ? "slot" : "block"} #${v.height} · ${v.latency}ms`, "live");
    }));
  }
  pollVitals();
  setInterval(pollVitals, CFG.vitalsRefreshMs || 15000);

  /* ---------- Token telemetry ---------- */
  async function telemetry() {
    const el = $("#telemetry");
    const rows = nets().map((n) => `<tr><td>${UI.netIcon(n, "net-ic sm")} ${esc(n.name)}</td><td><code>${Chain.tokenAddress(n.id) ? esc(UI.short(Chain.tokenAddress(n.id), 6)) : "pending"}</code></td><td data-sup="${n.id}">${Chain.tokenAddress(n.id) ? "reading…" : "—"}</td></tr>`).join("");
    el.innerHTML = `
      <div class="tel-h"><span class="tag">TOKEN TELEMETRY</span></div>
      <div class="tel-g">
        <div><small>TOKEN NAME</small><b>${esc(CFG.token.name)}</b></div>
        <div><small>SYMBOL</small><b class="amber">$${esc(CFG.token.symbol)}</b></div>
        <div><small>MODE</small><b>${single ? "Single · " + esc(prim.short) : "Multi · " + nets().length + " networks"}</b></div>
        <div><small>LOGIN</small><b>Read-only</b></div>
      </div>
      <table class="tbl"><thead><tr><th>Network</th><th>Contract</th><th>Total supply (on-chain)</th></tr></thead><tbody>${rows}</tbody></table>`;
    for (const n of nets()) {
      if (!Chain.tokenAddress(n.id)) continue;
      const s = await Chain.totalSupply(n.id);
      const td = el.querySelector(`[data-sup="${n.id}"]`);
      if (td) td.textContent = s == null ? "unreachable" : UI.num(s, 0) + " " + CFG.token.symbol;
    }
  }
  telemetry();

  /* ---------- Wards ---------- */
  $("#wards-title").textContent = single ? prim.ward : "Hospital Wards";
  $("#wards-sub").textContent = single
    ? `${CFG.token.name} is deployed exclusively on ${prim.name}. ${prim.tagline}`
    : `${CFG.token.name} operates ${nets().length} wards. Robinhood, Base and BSC share one EVM contract; Solana runs its own mint.`;
  $("#wards-grid").className = "wards" + (single ? " one" : "");
  $("#wards-grid").innerHTML = nets().map((n) => {
    const ca = Chain.tokenAddress(n.id);
    return `<article class="ward holo rv" style="--c:${n.color};--c2:${n.color2 || n.color}">
      <div class="ward-glow"></div>
      <div class="ward-h">${UI.netIcon(n, "net-ic xl")}<span><small>${esc(n.ward)}</small><h3>${esc(n.name)}</h3></span></div>
      <p>${esc(n.tagline)}</p>
      <dl>
        <dt>Type</dt><dd>${n.type === "solana" ? "SVM · SPL token" : "EVM · ERC-20"}</dd>
        ${n.chainId ? `<dt>Chain ID</dt><dd>${n.chainId}</dd>` : ""}
        <dt>Explorer</dt><dd><a href="${esc(n.explorer)}" target="_blank" rel="noopener">${esc(n.explorer.replace(/^https?:\/\//, ""))}</a></dd>
        <dt>CA</dt><dd><code>${ca ? esc(UI.short(ca, 6)) : "pending"}</code></dd>
      </dl>
      <div class="ward-a">
        <button class="btn btn-copy" ${ca ? `data-copy="${esc(ca)}"` : "disabled"}>${UI.ICONS.copy}<span>Copy CA</span></button>
        <button class="btn" data-login="${n.id}">Log in to ward</button>
      </div>
    </article>`;
  }).join("");
  document.querySelectorAll("[data-login]").forEach((b) => (b.onclick = () => UI.openWallet("wallets", b.dataset.login)));

  /* ---------- Patient record ---------- */
  function renderRecord() {
    const s = Wallet.state, lv = CFG.clearance || [];
    const n = s.network && Chain.get(s.network);
    const ca = n ? Chain.tokenAddress(n.id) : "";
    const cur = s.connected && ca && s.balance != null ? Wallet.clearance() : null;
    $("#rec-card").innerHTML = !s.connected
      ? `<div class="rec-empty"><svg viewBox="0 0 64 64"><rect x="10" y="8" width="44" height="50" rx="4"/><circle cx="32" cy="26" r="8"/><path d="M20 48c2-7 7-10 12-10s10 3 12 10"/></svg>
          <h3>No patient file open</h3><p>Connect a wallet to scan your identity. Read-only — nothing is signed or sent.</p>
          <button class="btn btn-pri" id="rec-connect">Connect wallet</button></div>`
      : `<div class="rec-f">
          <div class="rec-top"><span class="tag">PATIENT FILE</span><em class="st">VERIFIED</em></div>
          <div class="rec-id">${n ? UI.netIcon(n, "net-ic xl") : ""}<div><small>WALLET</small><code>${esc(s.address)}</code></div></div>
          <dl>
            <dt>Ward</dt><dd>${n ? esc(n.name) : "Unsupported network"}</dd>
            <dt>Wallet</dt><dd>${esc(s.walletName || "—")}</dd>
            <dt>${esc(UI.sym())} balance</dt><dd class="big">${!n ? "—" : !ca ? "CA pending" : s.balance == null ? "scanning…" : esc(UI.num(s.balance))}</dd>
            <dt>Clearance</dt><dd class="big amber">${cur ? esc(cur.code + " · " + cur.name) : "—"}</dd>
          </dl>
          ${cur ? `<p class="note">${esc(cur.note)}</p>` : ""}
          <div class="m-row"><button class="btn" id="rec-manage">Manage session</button></div>
        </div>`;
    $("#rec-connect")?.addEventListener("click", () => UI.openWallet());
    $("#rec-manage")?.addEventListener("click", () => UI.openWallet());
    $("#rec-ladder").innerHTML = `<div class="tel-h"><span class="tag">CLEARANCE LEVELS</span></div><ol class="ladder">${
      [...lv].sort((a, b) => b.min - a.min).map((l) => `<li class="${cur && cur.code === l.code ? "cur" : ""}"><span class="lc">${esc(l.code)}</span><span><b>${esc(l.name)}</b><small>${l.min > 0 ? "≥ " + UI.num(l.min) + " " + esc(UI.sym()) : "Any linked wallet"}</small></span></li>`).join("")
    }</ol>`;
  }
  renderRecord();
  window.addEventListener("wallet:change", renderRecord);

  /* ---------- Plan ---------- */
  $("#plan-grid").innerHTML = (CFG.roadmap || []).map((p) => `
    <article class="phase holo rv ${esc(p.status)}">
      <div class="ph-h"><span class="ph-n">PHASE ${esc(p.phase)}</span><em class="st">${esc(p.status.toUpperCase())}</em></div>
      <h3>${esc(p.title)}</h3>
      <ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <div class="ph-bar"><i></i></div>
    </article>`).join("");

  /* ---------- FAQ ---------- */
  $("#faq").innerHTML = `<span class="tag">FREQUENT QUERIES</span>` + (CFG.faq || []).map((f, i) =>
    `<details class="holo" ${i === 0 ? "open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("") +
    `<a class="btn" href="docs#faq">More in the docs →</a>`;

  /* ---------- Terminal ---------- */
  const out = $("#term-out"), input = $("#term-input");
  const print = (t, cls = "") => { const d = document.createElement("div"); d.className = "ln " + cls; d.innerHTML = t; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const C = {
    help: () => print(["Available commands:",
      "  <b>about</b>     what is WELIX", "  <b>vision</b>    our vision", "  <b>ca</b>        official contract addresses", "  <b>copy</b>      copy the first CA",
      "  <b>networks</b>  list active wards", "  <b>status</b>    live network vitals", "  <b>connect</b>   log in with a wallet",
      "  <b>whoami</b>    your patient file", "  <b>scan</b>      run a full-body scan", "  <b>plan</b>      treatment plan",
      "  <b>socials</b>   official channels", "  <b>docs</b>      open documentation", "  <b>clear</b>     clear the screen"].join("<br>")),
    about: () => print(esc(CFG.project.description)),
    vision: () => print(esc(CFG.project.vision) + "<br><span class='amber'>" + esc(CFG.project.name + " — " + CFG.project.signature) + "</span>"),
    ca: () => Chain.caGroups().forEach((g) => print(`${g.nets.map((n) => esc(n.short)).join("/")} → ${g.ca ? `<span class="amber">${esc(g.ca)}</span>` : "pending — announced on " + esc(CFG.social.xHandle || "X")}`)),
    copy: () => { const g = Chain.caGroups().find((x) => x.ca); g ? (UI.copy(g.ca), print("CA copied.", "ok")) : print("No CA published yet.", "err"); },
    networks: () => nets().forEach((n) => print(`<img class="net-ic sm" src="${esc(n.icon)}" alt=""> ${esc(n.name)} — ${esc(n.ward)}`)),
    status: async () => { print("pinging nodes…"); for (const n of nets()) { const v = await Chain.vitals(n.id); print(`${esc(n.short).padEnd(5)} ${v.online ? `<span class="ok">ONLINE</span> #${v.height.toLocaleString("en-US")} · ${v.latency}ms` : '<span class="err">NO SIGNAL</span>'}`); } },
    connect: () => { UI.openWallet(); print("auth window opened."); },
    whoami: () => { const s = Wallet.state; if (!s.connected) return print("anonymous. run <b>connect</b>.", "err"); const c = Wallet.clearance(); print(`${esc(s.address)}<br>ward: ${esc(s.network || "unsupported")} · balance: ${s.balance == null ? "—" : esc(UI.num(s.balance))} ${esc(UI.sym())} · clearance: ${c && s.balance != null ? esc(c.code + " " + c.name) : "—"}`); },
    scan: async () => { for (const [p, l] of [[12, "sleep"], [37, "nutrition"], [64, "fitness"], [88, "recovery"], [100, "mind"]]) { await new Promise((r) => setTimeout(r, 260)); print(`[${"█".repeat(p / 5).padEnd(20, "░")}] ${p}% ${l}`); } print("insight: <span class='amber'>" + esc(CFG.project.motto) + "</span> (demo animation — not medical advice)"); },
    plan: () => (CFG.roadmap || []).forEach((p) => print(`PHASE ${esc(p.phase)} ${esc(p.title)} [${esc(p.status)}]`)),
    socials: () => { if (CFG.social.x) print(`X → <a href="${esc(CFG.social.x)}" target="_blank" rel="noopener">${esc(CFG.social.xHandle || CFG.social.x)}</a>`); if (CFG.social.telegram) print(`Telegram → <a href="${esc(CFG.social.telegram)}" target="_blank" rel="noopener">${esc(CFG.social.telegramHandle || CFG.social.telegram)}</a>`); },
    docs: () => { print("opening docs…"); location.href = "docs"; },
    clear: () => (out.innerHTML = ""),
    sudo: () => print("nice try. the immune firewall saw that.", "err"),
  };
  print(`${esc(CFG.project.name)} OPERATOR CONSOLE · ${esc(CFG.project.systemId)}`);
  print("type <b>help</b> to begin.", "dim");
  $("#term-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cmd = input.value.trim().toLowerCase(); input.value = "";
    if (!cmd) return;
    print("&gt; " + esc(cmd), "cmd");
    const fn = C[cmd.split(/\s+/)[0]];
    fn ? await fn() : print(`command not found: ${esc(cmd)} — try <b>help</b>`, "err");
  });

  FX.reveal();
})();
