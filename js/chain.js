/* WELIX — network helpers + live on-chain reads (plain JSON-RPC, no libraries). */
(function () {
  const CFG = window.WELIX_CONFIG;

  const Chain = {
    isSingle() { return CFG.mode !== "multi"; },

    /** Main network: single → singleNetwork · multi → primaryNetwork. */
    primaryId() {
      const want = Chain.isSingle() ? CFG.singleNetwork : CFG.primaryNetwork;
      return CFG.networks[want] ? want : Object.keys(CFG.networks)[0];
    },

    /** Active networks: single → 1 · multi → all networks in multiOrder. */
    list() {
      if (Chain.isSingle()) return [Chain.get(Chain.primaryId())];
      return [...new Set([...(CFG.multiOrder || []), ...Object.keys(CFG.networks)])]
        .filter((id) => CFG.networks[id]).map(Chain.get);
    },

    get(id) { const n = CFG.networks[id]; return n ? { id, ...n, primary: id === Chain.primaryId() } : null; },
    byChainId(cid) { return Chain.list().find((n) => n.type === "evm" && n.chainId === Number(cid)) || null; },
    hex(cid) { return "0x" + Number(cid).toString(16); },

    /** EVM networks share token.address, Solana uses token.sol; a network `ca` overrides. */
    tokenAddress(id) {
      const n = CFG.networks[id];
      if (!n) return "";
      return (n.ca || (n.type === "solana" ? CFG.token.sol : CFG.token.address) || "").trim();
    },

    /** Networks sharing the same CA → one row / one Copy button. */
    caGroups() {
      return Chain.list().reduce((acc, n) => {
        const ca = Chain.tokenAddress(n.id);
        const key = ca ? ca.toLowerCase() : (n.type === "solana" ? "sol" : "evm");
        const g = acc.find((x) => x.key === key);
        g ? g.nets.push(n) : acc.push({ key, ca, nets: [n] });
        return acc;
      }, []);
    },

    explorerToken(id) { const n = CFG.networks[id], a = Chain.tokenAddress(id); return n && a ? n.explorer + n.explorerToken + a : ""; },
    explorerAddr(id, a) { const n = CFG.networks[id]; return n && a ? n.explorer + (n.explorerAddr || "/address/") + a : ""; },

    async rpc(id, method, params) {
      const urls = CFG.networks[id].rpcUrls || [];
      let last;
      for (const url of urls) {
        try {
          const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
          const res = await fetch(url, {
            method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
          });
          clearTimeout(to);
          const j = await res.json();
          if (j.error) throw new Error(j.error.message || "RPC error");
          return j.result;
        } catch (e) { last = e; }
      }
      throw last || new Error("No RPC");
    },

    /** Raw integer → decimal string. */
    format(raw, dec) {
      const b = BigInt(raw), d = 10n ** BigInt(dec);
      const i = b / d, f = (b % d).toString().padStart(dec, "0").replace(/0+$/, "");
      return i.toString() + (f ? "." + f : "");
    },

    evmCall(id, to, data, provider) {
      const params = [{ to, data }, "latest"];
      return provider ? provider.request({ method: "eth_call", params }) : Chain.rpc(id, "eth_call", params);
    },

    async evmDecimals(id, ca, provider) {
      try { return Number(BigInt(await Chain.evmCall(id, ca, "0x313ce567", provider))); }
      catch { return CFG.token.decimals; }
    },

    /** Live total supply, or null when CA not set / unreachable. */
    async totalSupply(id) {
      const n = CFG.networks[id], ca = Chain.tokenAddress(id);
      if (!n || !ca) return null;
      try {
        if (n.type === "solana") {
          const r = await Chain.rpc(id, "getTokenSupply", [ca]);
          return Chain.format(r.value.amount, r.value.decimals);
        }
        const dec = await Chain.evmDecimals(id, ca);
        return Chain.format(await Chain.evmCall(id, ca, "0x18160ddd"), dec);
      } catch { return null; }
    },

    /** $WLX balance of an address, or null. */
    async balanceOf(id, owner, provider) {
      const n = CFG.networks[id], ca = Chain.tokenAddress(id);
      if (!n || !ca || !owner) return null;
      try {
        if (n.type === "solana") {
          const r = await Chain.rpc(id, "getTokenAccountsByOwner", [owner, { mint: ca }, { encoding: "jsonParsed" }]);
          let raw = 0n, dec = 0;
          for (const acc of r.value || []) { const t = acc.account.data.parsed.info.tokenAmount; raw += BigInt(t.amount); dec = t.decimals; }
          return Chain.format(raw, dec);
        }
        const data = "0x70a08231" + owner.toLowerCase().replace(/^0x/, "").padStart(64, "0");
        const dec = await Chain.evmDecimals(id, ca, provider);
        return Chain.format(await Chain.evmCall(id, ca, data, provider), dec);
      } catch { return null; }
    },

    /** Live network vitals: block/slot height, RPC latency, gas (EVM). */
    async vitals(id) {
      const n = CFG.networks[id];
      const t0 = performance.now();
      try {
        if (n.type === "solana") {
          const slot = await Chain.rpc(id, "getSlot", []);
          return { online: true, height: Number(slot), latency: Math.round(performance.now() - t0), gas: null };
        }
        const bn = await Chain.rpc(id, "eth_blockNumber", []);
        const latency = Math.round(performance.now() - t0);
        let gas = null;
        try { gas = Number(BigInt(await Chain.rpc(id, "eth_gasPrice", []))) / 1e9; } catch {}
        return { online: true, height: Number(BigInt(bn)), latency, gas };
      } catch { return { online: false }; }
    },
  };

  window.Chain = Chain;
})();
