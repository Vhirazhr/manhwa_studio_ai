# Manhwa Studio AI

A personal, local-first workspace for developing a novel into a manhwa or webtoon.

## Current foundation

- Dark charcoal and pink creative-studio interface.
- One-upload story import for DOCX/TXT/Markdown, including embedded or separately selected art-reference images.
- Automatic local project mapping: synopsis, genre, themes, Character Bible, visual art direction, and storyboard scenes.
- Character bible for cast notes.
- Art direction reference library.
- Storyboard scene drafts.
- Local Ollama connection and first-pass novel analysis.
- Panel editor layout prototype.
- Browser local storage for workspace metadata and drafts.

## What works today

This first version is a frontend foundation. It does not call a paid API and it does not pretend that AI image generation is already connected. The storyboard paragraph splitter is a simple local utility, not an AI model.

The AI Studio now supports an optional local Ollama connection for novel analysis. The browser talks to Ollama through a Vite development/preview proxy at `127.0.0.1:11434`; no cloud API key is used. The target hardware is a laptop GPU with 6 GB VRAM and 16 GB system RAM, so start with a small 3B-class instruct model and test performance before moving to larger models.

## Run locally

Requirements: Node.js 20 or newer.

1. Clone this repository.
2. Install dependencies with npm install.
3. Start the development server with npm run dev.
4. Open the local URL printed by Vite.

### One-time local AI setup

1. Install and open [Ollama](https://ollama.com/download) on the same computer.
2. Start Manhwa Studio with `npm run dev`.
3. In **My Stories**, choose **Upload & auto-build** and select a DOCX (with an embedded art reference) or select a novel and image together.
4. If a vision model is not installed, click **Install AI engine** once. Manhwa Studio downloads `qwen2.5vl:3b` through your local Ollama runtime.
5. After setup, future uploads automatically analyze the story and visual reference and save the project map.

The first version analyzes up to 24,000 characters per upload (longer files are sampled at the beginning and end). It automatically creates the synopsis, genre/theme map, Character Bible, art-direction notes, and storyboard scene drafts. Chapter-by-chapter analysis for full-length novels is the next milestone. Everything runs through Ollama on your own machine; no paid API key is used.

Build for production with npm run build.

## Privacy and storage

Story and character data are currently stored in this browser's local storage. They are not uploaded to a server. Avoid clearing browser site data if you want to keep your current drafts. Large novel files may exceed browser storage limits; persistent file storage will be added in a later milestone.

## Roadmap

1. Finish and test the creative workspace UI.
2. Add robust local project and file storage and chapter management.
3. Expand local LLM analysis into chapter-by-chapter processing and continuity checks.
4. Add a local image-generation workflow and reference-guided character consistency.
5. Add vertical webtoon layout, speech bubbles, and export tools.
