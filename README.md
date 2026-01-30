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

## Features

- **Privacy-first**: All tools run entirely in your browser. No data is sent to any server.
- **No build step**: Static HTML files with no compilation required.
- **Mobile-friendly**: Responsive design works on phones and tablets.
- **Offline capable**: Once loaded, most tools work without an internet connection.
- **Worker-ready**: Cloudflare Pages Functions available for future server-side features.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

The dev server runs at `http://localhost:8788` with hot reload for both static files and functions.

### Project Structure

```
Tools/
├── functions/          # Cloudflare Pages Functions (Workers)
│   └── api/
│       └── hello.js    # Example API endpoint: /api/hello
├── public/             # Static files (served at root)
│   ├── index.html
│   ├── guitar-tuner.html
│   └── cards/
├── wrangler.toml       # Cloudflare configuration
└── package.json
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run deploy` | Deploy to Cloudflare Pages |
| `npm run preview` | Preview production build locally |

## Deployment

This site is hosted on [Cloudflare Pages](https://pages.cloudflare.com/) with a custom domain.

### Manual Deployment

```bash
# Deploy to production
npm run deploy
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

Functions in the `functions/` directory become API endpoints:

| File | Endpoint |
|------|----------|
| `functions/api/hello.js` | `/api/hello` |

Example usage:
```bash
curl "https://tools.parkerbarker.com/api/hello?name=Cameron"
# {"message":"Hello, Cameron!","timestamp":"...","method":"GET"}
```

## License

MIT
