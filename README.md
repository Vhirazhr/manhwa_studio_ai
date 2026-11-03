# Manhwa Studio AI

A personal, local-first workspace for developing a novel into a manhwa or webtoon.

## Current foundation

- Dark charcoal and pink creative-studio interface.
- Story library with local TXT and Markdown import.
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

### Optional: enable local AI analysis

1. Install and open [Ollama](https://ollama.com/download) on the same computer.
2. In a terminal, download a small instruct model. For example: `ollama pull qwen2.5:3b`.
3. Confirm that Ollama is running at `http://127.0.0.1:11434`.
4. Open **AI Studio** in Manhwa Studio and click **Check connection**.
5. Choose the installed model, select an imported novel, and click **Analyze novel**.

The current analysis sends up to 24,000 characters to the selected local model (for longer files, it samples the beginning and end). It returns suggested genre, logline, synopsis, themes, character candidates, and scene breakdowns. Review the suggestions before saving them. This is a first-pass single-request analysis; chapter-by-chapter processing and stronger consistency checks are planned next.

Build for production with npm run build.

## Privacy and storage

Story and character data are currently stored in this browser's local storage. They are not uploaded to a server. Avoid clearing browser site data if you want to keep your current drafts. Large novel files may exceed browser storage limits; persistent file storage will be added in a later milestone.

## Roadmap

1. Finish and test the creative workspace UI.
2. Add robust local project and file storage and chapter management.
3. Expand local LLM analysis into chapter-by-chapter processing and continuity checks.
4. Add a local image-generation workflow and reference-guided character consistency.
5. Add vertical webtoon layout, speech bubbles, and export tools.
