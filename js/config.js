window.WELIX_CONFIG = {
  /* ---------------- Brand ---------------- */
  project: {
    name: "WELIX",                                   // brand name (logo text, titles)
    tagline: "Your Wellness, Powered by AI.",
    signature: "Intelligence for a Better Life.",      // footer / closing line
    motto: "Understand Yourself. Improve Every Day. Live Better.",
    era: "2077",
    systemId: "WEX-MED-2077",                         // shown in terminal headers
    description:
      "WELIX is where artificial intelligence meets personal wellness. We believe that a healthier life begins with better understanding of yourself.",
    vision:
      "To make intelligent wellness accessible to everyone by combining human-centered design, artificial intelligence, and personalized technology.",
  },

  token: {
    name: "WELIX",       // token name
    symbol: "WEX",       // token symbol (shown as $WLX)
    decimals: 18,        // fallback only — the real value is read on-chain
    address: "",         // EVM CA shared by Robinhood, Base and BSC (leave "" until launch)
    sol: "",             // Solana mint address (leave "" until launch)
  },

  mode: "single",
  singleNetwork: "robinhood",                              // solana | robinhood | base | bsc
  multiOrder: ["solana", "robinhood", "base", "bsc"],
  primaryNetwork: "robinhood",                             // default network for wallet login in multi mode

  networks: {
    solana: {
      name: "Solana",
      short: "SOL",
      type: "solana",
      rpcUrls: ["https://api.mainnet-beta.solana.com"],
      explorer: "https://solscan.io",
      explorerToken: "/token/",
      explorerAddr: "/account/",
      color: "#14F195",
      color2: "#9945FF",
      ward: "Ward S — Hyperspeed Triage",
      tagline: "Sub-second diagnostics at memecoin velocity.",
      icon: "assets/networks/solana.svg",
      ca: "",                                         // optional per-network override
    },
    robinhood: {
      name: "Robinhood Chain",
      short: "RH",
      type: "evm",
      chainId: 4663,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
      explorer: "https://robinhoodchain.blockscout.com",
      explorerToken: "/token/",
      explorerAddr: "/address/",
      color: "#CCFF00",
      color2: "#7AFF3A",
      ward: "Ward R — Trading Floor ICU",
      tagline: "Low-fee L2 vitals for the trading generation.",
      icon: "assets/networks/robinhood.svg",
      ca: "",
    },
    base: {
      name: "Base",
      short: "BASE",
      type: "evm",
      chainId: 8453,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://mainnet.base.org"],
      explorer: "https://basescan.org",
      explorerToken: "/token/",
      explorerAddr: "/address/",
      color: "#3D7BFF",
      color2: "#0052FF",
      ward: "Ward B — Onchain Recovery",
      tagline: "Ethereum-secured care, built onchain.",
      icon: "assets/networks/base.svg",
      ca: "",
    },
    bsc: {
      name: "BNB Smart Chain",
      short: "BSC",
      type: "evm",
      chainId: 56,
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: ["https://bsc-dataseed.bnbchain.org", "https://bsc-dataseed1.binance.org"],
      explorer: "https://bscscan.com",
      explorerToken: "/token/",
      explorerAddr: "/address/",
      color: "#F0B90B",
      color2: "#FFD24A",
      ward: "Ward N — High-Volume Emergency",
      tagline: "Massive throughput for a massive patient base.",
      icon: "assets/networks/bsc.svg",
      ca: "",
    },
  },

  /* ---------------- Socials (empty = hidden) ---------------- */
  social: {
    x: "https://x.com/WELIXautos",
    xHandle: "@WELIXautos",
    telegram: "",          // e.g. "https://t.me/welix"
    telegramHandle: "",
  },

  /* ---------------- Holder clearance levels ----------------
   * Computed from the connected wallet's REAL on-chain $WLX balance.
   * `min` is a token amount (not USD). Highest matching level wins.
   */
  clearance: [
    { min: 0,           code: "C-0", name: "Visitor",        note: "Wallet linked. No $WLX detected yet." },
    { min: 1,           code: "C-1", name: "Patient",        note: "Admitted to the ward." },
    { min: 100000,      code: "C-2", name: "Medic",          note: "Field access to diagnostic bays." },
    { min: 1000000,     code: "C-3", name: "Surgeon",        note: "Clearance for the operating theatre." },
    { min: 10000000,    code: "C-4", name: "Chief of AI",    note: "Direct line to the WELIX core." },
  ],

  /* ---------------- Roadmap ("Treatment Plan") ----------------
   * status: "done" | "active" | "queued"
   */
  roadmap: [
    { phase: "01", title: "Boot Sequence", status: "active",
      items: ["Brand & terminal website online", "X community launch", "Token deployment & CA published"] },
    { phase: "02", title: "Diagnosis", status: "queued",
      items: ["Listings on chain trackers", "Holder clearance system live", "Community memes & lore drops"] },
    { phase: "03", title: "Sequencing", status: "queued",
      items: ["Multi-network wards (SOL · RH · BASE · BSC)", "Telegram command center", "Partnership consultations"] },
    { phase: "04", title: "Evolution", status: "queued",
      items: ["Community-voted upgrades", "WELIX lore expansions", "Next-gen terminal modules"] },
  ],

  /* ---------------- FAQ ---------------- */
  faq: [
    { q: "What is WELIX?",
      a: "WELIX is where artificial intelligence meets personal wellness — an intelligent ecosystem for sleep, nutrition, fitness, recovery and mental well-being. $WLX is the community token of the WELIX ecosystem." },
    { q: "Is WELIX a medical service?",
      a: "No. WELIX is about wellness insights and healthier daily habits. It does not diagnose or treat any condition and is not a substitute for professional medical advice." },
    { q: "Where do I find the official contract address?",
      a: "Only on this website and the official X account. The CA box shows the network logo next to each address so you always know which chain it belongs to." },
    { q: "Why does the same CA appear on Robinhood, Base and BSC?",
      a: "In multi-network mode the EVM deployments share one address. Solana uses a different address format, so it has its own mint." },
    { q: "Does connecting my wallet cost anything?",
      a: "No. Login only reads your address and $WLX balance. The site never asks you to approve spending or send funds." },
  ],

  /* ---------------- Misc ---------------- */
  vitalsRefreshMs: 15000,   // live network vitals refresh interval
  bootSequence: true,       // show the boot screen once per browser session
};
