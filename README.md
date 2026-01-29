# Tools

A collection of browser-based utilities. No server required - everything runs locally in your browser.

**Live site:** [tools.parkerbarker.com](https://tools.parkerbarker.com)

## Tools

| Tool | Description |
|------|-------------|
| [Ukulele Tuner](ukulele-tuner.html) | Tune your ukulele using your microphone with real-time pitch detection |
| [Guitar Tuner](guitar-tuner.html) | Tune your guitar with real-time note detection |
| [Image Editor](image-editor.html) | Crop and edit images locally - no uploads required |
| [Test Timer](test-timer.html) | Multiple countdown timers for tests and timed activities |
| [Voice Validator](voice-validator.html) | Record and playback voice for pronunciation practice |
| [Card Survey](cards/survey.html) | Interactive card display and survey tool |

## Features

- **Privacy-first**: All tools run entirely in your browser. No data is sent to any server.
- **No dependencies**: Just open the HTML files - no build step or installation required.
- **Mobile-friendly**: Responsive design works on phones and tablets.
- **Offline capable**: Once loaded, most tools work without an internet connection.

## Running Locally

Simply open any HTML file in your browser, or start a local server:

```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

## Hosting

This site is hosted on GitHub Pages with a custom domain. The `CNAME` file configures the custom domain `tools.parkerbarker.com`.

## License

MIT
