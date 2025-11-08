# VVT Text Stream Viewer

A minimal web app for previewing video files alongside `.vvt` or `.vtt` caption tracks. The UI is written in HTML and CSS while the logic resides in JavaScript, making it easy to view in any browser.

## Getting started

1. Ensure you have [Node.js](https://nodejs.org/) installed (version 18 or newer).
2. Install dependencies (none are required, but this step keeps `npm` happy):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser to [http://localhost:3000](http://localhost:3000) and drop a video file plus its matching `.vvt`/`.vtt` captions into the page.

## How it works

- `index.html` provides the structure and styling.
- `app.js` handles drag-and-drop, file parsing, and caption synchronization.
- `server.js` is a lightweight Node.js script that serves the static files so you can launch the viewer with `npm start`.

Feel free to expand the viewer with additional features such as timeline controls or multiple caption tracks.
