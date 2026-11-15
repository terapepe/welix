/* WELIX — wallet login: EVM wallets (EIP-6963 / EIP-1193) and Solana wallets (injected). */
(function () {
  const evmProviders = new Map(); // rdns -> { info, provider }
  const KEY = "welix.wallet";
  const SOL_WALLETS = [
    { key: "phantom", name: "Phantom", url: "https://phantom.app", get: () => window.phantom?.solana?.isPhantom ? window.phantom.solana : (window.solana?.isPhantom ? window.solana : null) },
    { key: "solflare", name: "Solflare", url: "https://solflare.com", get: () => window.solflare?.isSolflare ? window.solflare : null },
    { key: "backpack", name: "Backpack", url: "https://backpack.app", get: () => window.backpack?.solana || null },
  ];
  const EVM_INSTALL = [
    { name: "MetaMask", url: "https://metamask.io/download/" },
    { name: "Rabby", url: "https://rabby.io" },
    { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet" },
  ];
  const EMPTY = { connected: false, type: null, network: null, address: null, provider: null, walletName: null, rdns: null, balance: null };

  const W = {
    state: { ...EMPTY },
    EVM_INSTALL,

    init() {
      window.addEventListener("eip6963:announceProvider", (e) => {
        const { info, provider } = e.detail || {};
        if (info && provider) evmProviders.set(info.rdns || info.uuid, { info, provider });
      });
      window.dispatchEvent(new Event("eip6963:requestProvider"));
      W.restore();
    },

    evmWallets() {
      const list = [...evmProviders.values()];
      if (!list.length && window.ethereum) {
        list.push({ info: { name: window.ethereum.isMetaMask ? "MetaMask" : "Browser Wallet", rdns: "injected", icon: "" }, provider: window.ethereum });
      }
      return list;
    },

    solWallets() {
      return SOL_WALLETS.map((w) => ({ key: w.key, name: w.name, url: w.url, icon: w.get()?.icon || "", installed: !!w.get() }));
    },

    connect(netId, key) {
      return Chain.get(netId)?.type === "solana" ? W.connectSol(netId, key) : W.connectEvm(netId, key);
    },

    async connectSol(netId, key) {
      const def = SOL_WALLETS.find((w) => w.key === key), p = def && def.get();
      if (!p) throw new Error(`${def ? def.name : "Solana wallet"} not detected.`);
      const r = await p.connect();
      const pk = (r && r.publicKey) || p.publicKey;
      W.set({ connected: true, type: "solana", network: netId, address: pk.toString(), provider: p, walletName: def.name, rdns: key });
      if (!p._welixBound && p.on) {
        p._welixBound = true;
        p.on("accountChanged", (k) => { if (W.state.type === "solana") k ? W.set({ address: k.toString() }) : W.disconnect(); });
      }
    },

    async connectEvm(netId, rdns) {
      const net = Chain.get(netId);
      const entry = W.evmWallets().find((w) => (w.info.rdns || "injected") === rdns) || W.evmWallets()[0];
      if (!entry) throw new Error("No EVM wallet detected. Install MetaMask, Rabby, Coinbase Wallet or similar.");
      const p = entry.provider;
      const accounts = await p.request({ method: "eth_requestAccounts" });
      await W.switchEvm(p, net);
      W.set({ connected: true, type: "evm", network: netId, address: accounts[0], provider: p, walletName: entry.info.name, rdns: entry.info.rdns || "injected" });
      W.bindEvm(p);
    },

    async switchEvm(p, net) {
      const chainId = Chain.hex(net.chainId);
      try {
        await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
      } catch (e) {
        if (e.code === 4902 || /unrecognized|not added|unknown chain/i.test(e.message || "")) {
          await p.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId, chainName: net.name, nativeCurrency: net.nativeCurrency, rpcUrls: net.rpcUrls, blockExplorerUrls: [net.explorer] }],
          });
        } else throw e;
      }
    },

    bindEvm(p) {
      if (p._welixBound || !p.on) return;
      p._welixBound = true;
      p.on("accountsChanged", (a) => { a.length ? W.set({ address: a[0] }) : W.disconnect(); });
      p.on("chainChanged", (cid) => { const n = Chain.byChainId(parseInt(cid, 16)); W.set({ network: n ? n.id : null }); });
    },

    async disconnect() {
      if (W.state.type === "solana" && W.state.provider?.disconnect) { try { await W.state.provider.disconnect(); } catch {} }
      W.state = { ...EMPTY };
      try { localStorage.removeItem(KEY); } catch {}
      W.emit();
    },

    set(patch) {
      Object.assign(W.state, patch);
      if (W.state.connected) {
        try { localStorage.setItem(KEY, JSON.stringify({ type: W.state.type, network: W.state.network, rdns: W.state.rdns })); } catch {}
      }
      W.emit();
      if ("address" in patch || "network" in patch) W.refreshBalance();
    },

    async refreshBalance() {
      const s = W.state;
      s.balance = null;
      if (!s.connected || !s.network) return W.emit();
      s.balance = await Chain.balanceOf(s.network, s.address, s.type === "evm" ? s.provider : null);
      W.emit();
    },

    /** Silent reconnect if this site was already authorised. */
    restore() {
      let saved; try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
      if (!saved) return;
      setTimeout(async () => {
        try {
          if (saved.type === "solana") {
            const def = SOL_WALLETS.find((w) => w.key === saved.rdns), p = def && def.get();
            if (!p || !Chain.get(saved.network) || !Chain.list().some((n) => n.id === saved.network)) return;
            const r = await p.connect({ onlyIfTrusted: true });
            const pk = (r && r.publicKey) || p.publicKey;
            if (pk) W.set({ connected: true, type: "solana", network: saved.network, address: pk.toString(), provider: p, walletName: def.name, rdns: def.key });
          } else if (saved.type === "evm") {
            const entry = W.evmWallets().find((w) => (w.info.rdns || "injected") === saved.rdns) || W.evmWallets()[0];
            if (!entry) return;
            const acc = await entry.provider.request({ method: "eth_accounts" });
            if (!acc.length) return;
            const cid = await entry.provider.request({ method: "eth_chainId" });
            const n = Chain.byChainId(parseInt(cid, 16));
            W.set({ connected: true, type: "evm", network: n ? n.id : null, address: acc[0], provider: entry.provider, walletName: entry.info.name, rdns: entry.info.rdns || "injected" });
            W.bindEvm(entry.provider);
          }
        } catch {}
      }, 400);
    },

    /** Clearance level from the real balance (config.clearance). */
    clearance() {
      const levels = [...(window.WELIX_CONFIG.clearance || [])].sort((a, b) => a.min - b.min);
      const bal = Number(W.state.balance || 0);
      let lvl = levels[0] || null;
      for (const l of levels) if (bal >= l.min) lvl = l;
      return lvl;
    },

    emit() { window.dispatchEvent(new CustomEvent("wallet:change", { detail: W.state })); },
  };

  window.Wallet = W;
})();
