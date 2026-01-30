# Tools

A collection of browser-based utilities. No server required - everything runs locally in your browser.

**Live site:** [tools.parkerbarker.com](https://tools.parkerbarker.com)

## Tools

| Tool | Description |
|------|-------------|
| [Ukulele Tuner](public/ukulele-tuner.html) | Tune your ukulele using your microphone with real-time pitch detection |
| [Guitar Tuner](public/guitar-tuner.html) | Tune your guitar with real-time note detection |
| [Image Editor](public/image-editor.html) | Crop and edit images locally - no uploads required |
| [Test Timer](public/test-timer.html) | Multiple countdown timers for tests and timed activities |
| [Voice Validator](public/voice-validator.html) | Record and playback voice for pronunciation practice |
| [Card Survey](public/cards/survey.html) | Interactive card display and survey tool |
| [Worker Demo](public/worker-demo.html) | Interactive demos of Cloudflare Workers, D1, KV, and AI |

## Features

- **Privacy-first**: All tools run entirely in your browser. No data is sent to any server.
- **No build step**: Static HTML files with no compilation required.
- **Mobile-friendly**: Responsive design works on phones and tablets.
- **Offline capable**: Once loaded, most tools work without an internet connection.
- **Cloudflare powered**: D1 (SQLite), KV (key-value), and Workers AI available for server-side features.

## Development

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- Cloudflare account (free tier works)

### Quick Start

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

The dev server runs at `http://localhost:8788` with hot reload for static files and functions.

### Project Structure

```
Tools/
├── functions/              # Cloudflare Pages Functions (Workers)
│   └── api/
│       ├── hello.js        # Example: /api/hello
│       └── demo/
│           ├── time.js     # Server time
│           ├── info.js     # Request info
│           ├── echo.js     # Text transform
│           ├── random.js   # Random generator
│           ├── db.js       # D1 SQLite demo
│           ├── kv.js       # KV store demo
│           └── ai.js       # Workers AI demo
├── public/                 # Static files (served at root)
│   ├── index.html
│   ├── worker-demo.html
│   ├── guitar-tuner.html
│   └── cards/
├── scripts/
│   └── setup.sh            # Create D1/KV resources
├── wrangler.toml           # Cloudflare configuration
└── package.json
```

### Setting Up Cloudflare Resources

For features that need D1 (database) or KV (key-value storage):

```bash
# Login to Cloudflare
npx wrangler login

# Create resources for a project (interactive)
./scripts/setup.sh

# Or specify a project name
./scripts/setup.sh myproject          # Creates myproject-db + MYPROJECT_KV
./scripts/setup.sh users --d1-only    # Only D1
./scripts/setup.sh cache --kv-only    # Only KV
```

The script outputs config to add to `wrangler.toml`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local development server |
| `pnpm deploy` | Deploy to Cloudflare Pages |
| `pnpm preview` | Preview production build locally |

### Wrangler CLI Reference

Common commands for managing Cloudflare resources:

```bash
# Authentication
npx wrangler login              # Login to Cloudflare
npx wrangler whoami             # Check current user

# Development
npx wrangler pages dev public   # Local dev server
npx wrangler pages deploy public # Deploy to production

# D1 Database
npx wrangler d1 list                        # List databases
npx wrangler d1 create <name>               # Create database
npx wrangler d1 execute <name> --command "SELECT * FROM table"  # Run SQL
npx wrangler d1 execute <name> --file schema.sql                # Run SQL file

# KV Store
npx wrangler kv namespace list              # List namespaces
npx wrangler kv namespace create <name>     # Create namespace
npx wrangler kv key list --namespace-id <id>    # List keys
npx wrangler kv key get <key> --namespace-id <id>   # Get value

# Logs & Debugging
npx wrangler pages deployment tail          # Stream live logs
npx wrangler tail                           # Tail worker logs
```

## Deployment

This site is hosted on [Cloudflare Pages](https://pages.cloudflare.com/) with a custom domain.

### Manual Deployment

```bash
pnpm deploy
```

### Automatic Deployment

Connect your GitHub repository to Cloudflare Pages:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
2. Create a new project and connect your GitHub repo
3. Configure build settings:
   - Build command: (leave empty - no build step needed)
   - Build output directory: `public`
4. Deploy

### Custom Domain Setup

1. In Cloudflare Pages project settings, go to "Custom domains"
2. Add `tools.parkerbarker.com`
3. Since DNS is already on Cloudflare, it will auto-configure

## API Functions

Functions in `functions/` automatically become API endpoints:

| File | Endpoint | Description |
|------|----------|-------------|
| `functions/api/hello.js` | `/api/hello` | Hello world example |
| `functions/api/demo/time.js` | `/api/demo/time` | Server timestamp |
| `functions/api/demo/db.js` | `/api/demo/db` | D1 SQLite guestbook |
| `functions/api/demo/kv.js` | `/api/demo/kv` | KV persistent counter |
| `functions/api/demo/ai.js` | `/api/demo/ai` | Workers AI (chat, summarize, etc.) |

Example:
```bash
curl "https://tools.parkerbarker.com/api/hello?name=Cameron"
# {"message":"Hello, Cameron!","timestamp":"...","method":"GET"}
```

## Free Tier Limits

| Service | Limit |
|---------|-------|
| D1 | 5GB storage, 5M reads/day, 100K writes/day |
| KV | 1GB storage, 100K reads/day, 1K writes/day |
| Workers AI | 10,000 neurons/day |
| Pages | 500 builds/month, unlimited requests |

## License

MIT
