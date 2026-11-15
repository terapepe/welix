/* WELIX — docs page. */
(function () {
  const CFG = window.WELIX_CONFIG;
  const { $, esc } = UI;
  UI.init("docs");
  FX.ecg($("#ecg"));
  const nets = Chain.list(), single = Chain.isSingle();

  $("#d-netcount").textContent = single ? nets[0].name : nets.length + " (" + nets.map((n) => n.short).join(" · ") + ")";
  $("#d-x").innerHTML = CFG.social.x ? `<a href="${esc(CFG.social.x)}" target="_blank" rel="noopener">${esc(CFG.social.xHandle || "X")}</a>` : "—";
  UI.caBlock($("#doc-ca"));

  $("#d-mode").textContent = single
    ? `This site runs in single mode on ${nets[0].name}.`
    : `This site runs in multi mode across ${nets.length} networks.`;
  $("#d-nets").innerHTML = `<tr><th>Network</th><th>Ward</th><th>Type</th><th>Chain ID</th><th>Contract</th><th>Explorer</th></tr>` +
    nets.map((n) => {
      const ca = Chain.tokenAddress(n.id);
      return `<tr><td>${UI.netIcon(n, "net-ic sm")} ${esc(n.name)}</td><td>${esc(n.ward)}</td><td>${n.type === "solana" ? "SVM" : "EVM"}</td><td>${n.chainId || "—"}</td>
        <td>${ca ? `<button class="btn-ic" data-copy="${esc(ca)}" title="Copy CA"><code>${esc(UI.short(ca, 6))}</code>${UI.ICONS.copy}</button>` : "pending"}</td>
        <td><a href="${esc(ca ? Chain.explorerToken(n.id) : n.explorer)}" target="_blank" rel="noopener">${esc(n.explorer.replace(/^https?:\/\//, ""))}</a></td></tr>`;
    }).join("");

  $("#d-levels").innerHTML = `<tr><th>Code</th><th>Level</th><th>Requirement</th><th>Description</th></tr>` +
    [...(CFG.clearance || [])].sort((a, b) => a.min - b.min).map((l) =>
      `<tr><td><code>${esc(l.code)}</code></td><td><b>${esc(l.name)}</b></td><td>${l.min > 0 ? "≥ " + UI.num(l.min) + " " + esc(UI.sym()) : "Any linked wallet"}</td><td>${esc(l.note)}</td></tr>`).join("");

  $("#d-faq").innerHTML = (CFG.faq || []).map((f) => `<details class="holo"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  /* Active section highlight */
  const links = [...document.querySelectorAll("#docs-nav a")];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-30% 0px -60% 0px" });
  document.querySelectorAll(".docs-body section").forEach((s) => io.observe(s));
})();
