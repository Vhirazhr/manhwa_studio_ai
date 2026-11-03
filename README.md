# Manhwa Studio AI

A personal, local-first workspace for developing a novel into a manhwa or webtoon.

## Current foundation

- Dark charcoal and pink creative-studio interface.
- Story library with local TXT and Markdown import.
- Character bible for cast notes.
- Art direction reference library.
- Storyboard scene drafts.
- Panel editor layout prototype.
- Browser local storage for workspace metadata and drafts.

## What works today

This first version is a frontend foundation. It does not call a paid API and it does not pretend that AI image generation is already connected. The storyboard paragraph splitter is a simple local utility, not an AI model.

The next engineering milestone is to add a local backend that can run on the creator's own machine, then connect a local language model and image-generation workflow. The target hardware is a laptop GPU with 6 GB VRAM and 16 GB system RAM, so model selection and low-VRAM settings will matter.

## Run locally

Requirements: Node.js 20 or newer.

1. Clone this repository.
2. Install dependencies with npm install.
3. Start the development server with npm run dev.
4. Open the local URL printed by Vite.

Build for production with npm run build.

## Privacy and storage

Story and character data are currently stored in this browser's local storage. They are not uploaded to a server. Avoid clearing browser site data if you want to keep your current drafts. Large novel files may exceed browser storage limits; persistent file storage will be added in a later milestone.

## Roadmap

1. Finish and test the creative workspace UI.
2. Add robust local project and file storage and chapter management.
3. Add a local text-processing pipeline for scene extraction.
4. Add local LLM support for story understanding and storyboard assistance.
5. Add a local image-generation workflow and reference-guided character consistency.
6. Add vertical webtoon layout, speech bubbles, and export tools.
