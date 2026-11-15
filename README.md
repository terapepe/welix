# WELIX — Your Wellness, Powered by AI. ($WLX)

<p align="center"><img src="assets/brand/welix-lockup.svg" alt="WELIX" height="90"></p>

WELIX is where artificial intelligence meets personal wellness — sleep, nutrition, fitness, recovery and mental well-being in one intelligent ecosystem. *Intelligence for a Better Life.*

Static website (HTML / CSS / vanilla JS, **no build step**), styled as a futuristic AI terminal:
layered hologram windows, a live kernel log, a body scanner, a DNA sequencer and a pulsing AI core.

- **Token:** WELIX · **Symbol:** $WLX
- **X:** [@WELIXautos](https://x.com/WELIXautos)
- **Pages:** `index.html` (terminal) · `docs.html` (manual)

## Features

- **CA box with network logos** — each contract address is shown with its network's SVG, a **Copy CA** button and explorer links. Shared EVM addresses are grouped (Robinhood · Base · BSC).
- **Wallet login** — EVM wallets via EIP-6963 (MetaMask, Rabby, Coinbase Wallet… network switched/added automatically) and Solana wallets (Phantom, Solflare, Backpack). Read-only: no approvals, no transfers.
- **Single / multi network mode** — single mode re-themes the whole site in the chosen network's colors; multi mode always shows Solana, Robinhood Chain, Base and BSC.
- **Live data only** — network vitals (block/slot height, RPC latency, gas), total supply and wallet balance are read directly from public RPC nodes. No demo data.
- **Clearance levels** — computed from the wallet's real $WLX balance.
- **Operator console** — interactive terminal (`help`, `ca`, `status`, `scan`, `whoami`…).
- **Docs** — overview, quick start, wallet login, CA verification, networks, safety, brand kit, FAQ, maintainer guide.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Works on GitHub Pages, Vercel, Netlify or any shared hosting (just upload the files).

## Configuration — `js/config.js`

Everything you may change later is in one file.

| Key | Purpose |
|---|---|
| `project.name`, `tagline`, `description`, `motto`, `vision`, `signature`, `systemId` | Brand texts |
| `token.name`, `token.symbol` | Token name / symbol (shown everywhere) |
| `token.address` | EVM CA shared by Robinhood, Base and BSC — leave `""` until launch |
| `token.sol` | Solana mint address — leave `""` until launch |
| `mode` | `"single"` or `"multi"` |
| `singleNetwork` | `solana` \| `robinhood` \| `base` \| `bsc` — network shown & themed in single mode |
| `multiOrder` | Network order in multi mode |
| `primaryNetwork` | Default login network in multi mode |
| `networks.<id>` | `name`, `short`, `color`, `color2`, `ward`, `tagline`, `icon`, RPC, explorer, optional `ca` override |
| `social.x`, `social.telegram` (+ handles) | Official links — empty values are hidden |
| `clearance` | Holder levels (token amount thresholds) |
| `roadmap`, `faq` | Treatment Plan and FAQ content |
| `vitalsRefreshMs`, `bootSequence` | Vitals refresh interval, boot screen on/off |

### Examples

Publish the CA:

```js
token: { name: "WELIX", symbol: "WLX", decimals: 18, address: "0xYourEvmCA", sol: "YourSolanaMint" },
```

Switch to a single network (site re-themes to Solana):

```js
mode: "single",
singleNetwork: "solana",
```

Add Telegram:

```js
social: { x: "https://x.com/WELIXautos", xHandle: "@WELIXautos", telegram: "https://t.me/yourgroup", telegramHandle: "@yourgroup" },
```

## Structure

```
index.html        Terminal (landing)
docs.html         Documentation
css/style.css     Theme (deep black · amber · electric blue)
js/config.js      ← all settings
js/chain.js       Network helpers + JSON-RPC reads
js/wallet.js      EVM + Solana wallet login
js/ui.js          Header, footer, CA blocks, wallet modal, toasts
js/fx.js          Visual effects (boot, ECG, DNA, field, code stream)
js/home.js        Landing page logic + console
js/docs.js        Docs page logic
assets/brand/     Logo mark, lockup, X banner (SVG)
assets/networks/  Network icons (SVG)
```

## Disclaimer

WELIX is a community token. All medical imagery is science fiction — not a medical device, not medical advice, not financial advice.
