# MotionCanva 🎬⚡

> **Industry-Level 2D Minimalist Vector Motion Design, Kinetic Typography & Data-in-Motion Engine**  
> Built with [Motion Canvas](https://motioncanvas.io/), TypeScript, Edge Neural TTS, and Autonomous Multi-Agent Intelligence.

---

## 🌟 Overview

**MotionCanva** is an automated production suite designed to create motion graphics and explainer videos (both **16:9 Landscape** and **9:16 Vertical Shorts**) matching the visual elegance of Linear.app, Stripe Press, and Apple Keynotes, combined with the mathematical clarity of 3Blue1Brown.

It integrates:
- **Motion Canvas + TypeScript**: Code-driven, mathematically precise 2D vector animation.
- **Edge Neural Voiceover**: Automated narration using Microsoft Edge's `en-US-AvaMultilingualNeural` voice.
- **Frontier T (Thumbnail Intelligence)**: 1080×1920 vector thumbnail generation backed by optical physics contrast audits.
- **Frontier S (Script Intelligence)**: 20-year veteran scriptwriting engine with zero-second hooks, jagged cadence, and infinite audio loops.
- **Multi-Project Hub & 1-Click Toolbar**: Permanent project storage, instant browser switching, 1-click rendering, and 1-click sync to [RightClips](https://github.com/phyroosh/RightClips).

---

## 🚀 Key Features

### 1. Minimalist Vector Motion & Kinetic Typography
- **Geometric Purity**: 1.5px–2px crisp vector strokes, subtle ambient glows (`rgba(99, 102, 241, 0.25)`), and clean dark layouts (`#0B0F17`).
- **Kinetic Typography Choreography**: Masked vector reveals, staggered cascades, and word-by-word electric accent highlights.
- **Data-in-Motion**: Animated signal counters, auto-drawing bezier curves, and living telemetry graphs.

### 2. Frontier S: 20-Year Veteran Script Intelligence
- **Phase 1: Zero-Second Hook Engine (0–3s)**: Halts scroll velocity through 4 high-conversion hook archetypes (*The Inverted Truth*, *In Media Res*, *The Negative Constraint*, *Sensory Micro-Specificity*). Strictly bans rhetorical questions and platitudes.
- **Phase 2: The Lock-In Phase (3–45s)**: Jagged cadence calibration (alternating 3-word punches with 10–14 word explanations), causal opposition ("Therefore" / "However" over "and then"), and open-loop stacking.
- **Phase 3: Zero-Fluff Payoff & Infinite Audio Loop**: The final sentence syntactically feeds directly back into Line 1 so short-form replays loop seamlessly.
- **Automated Script Linter**: Enforces 65–110 word limits, 18-word monologue caps, paired `[visual cues]`, and zero hedging words.

### 3. Frontier T: Thumbnail Intelligence System
- **Creative Decision Director**: Analyzes psychological tension across cognitive domains and selects proven thumbnail archetypes (*Impossible Metaphor*, *Scale Constraint*, *Minimal Object*, *Split Contradiction*).
- **High-Res Vector Renderer**: Generates 1080×1920 SVG/vector artwork with glowing focal cores and 1–3 massive punch words.
- **Multi-Scale Optical Physics Validator**: Enforces Mobile Feed Survival (360×640 RMS contrast $\ge 30.0$) and Peripheral Vision Gaussian Blur tests (blurred contrast $\ge 22.0$).

### 4. YouTube Shorts Metadata & RightClips Integration
- **Viral Shorts Metadata**: Generates high-CTR hook titles, 5-part retention-optimized descriptions, tags, and pinned comments.
- **RightClips Bridge**: Syncs rendered `.mp4`, `.png` thumbnails, and metadata directly to RightClips Studio for automated publishing.
- **1-Click UI Controls**: Custom `RENDER` and `EXPORT TO RIGHTCLIPS` buttons directly inside the Motion Canvas playback toolbar.

### 5. 3-Modal Input Architecture & Persistent Podcast Queue
- **3 Input Ways**: Provide a **Script**, a **Topic**, or a **Podcast Link** (YouTube URL).
- **Zero-Download Podcast Extraction**: Uses direct Gemini video reasoning (Tier 1) or zero-download captions & chapter analysis via `youtube-transcript-api` and `yt-dlp` (Tier 2) with 0 bytes of media downloaded.
- **Local Persistent Topic Queue**: Automatically saves extracted topics into `data/topics_queue.json`.
- **Interactive Multi-Choice Selection**: Presents topics via interactive modals (`ask_question`). Selecting one topic marks it completed while preserving all unselected topics for future sessions.
- **Stored Queue Triggers**: Say *"Time for reel generation, show me the stored next topics"* or start generation without inputs to automatically pull from backlog.

---

## 📂 Project Structure

```
.
├── .agents/skills/           # Agent skill definitions & instructions
├── data/
│   └── topics_queue.json     # Local persistent backlog of reel topics
├── references/               # Design systems, API docs, code recipes
├── scripts/
│   ├── export_to_rightclips.mjs  # Syncs video & metadata to RightClips
│   ├── generate_metadata.py      # Viral YouTube Shorts metadata generator
│   ├── generate_voice.py         # Microsoft Edge Neural Voice synthesizer
│   ├── patch_ui.mjs              # Injects Render & Export buttons into Motion Canvas UI
│   ├── podcast_processor.py      # Zero-download podcast extractor & topic distiller
│   ├── publish_youtube.mjs       # Standalone YouTube Data API v3 publisher
│   ├── script_intelligence.py    # Frontier S Script generator & linter
│   ├── thumbnail_director.py     # Frontier T Creative Decision Director
│   ├── thumbnail_renderer.mjs    # 1080x1920 vector thumbnail renderer
│   ├── topic_queue.py            # Local topic queue manager & status tracker
│   └── validate_thumbnail.py     # Optical physics contrast validator
├── src/
│   ├── projects/                 # Permanent project storage & metadata
│   ├── scenes/                   # Motion Canvas TypeScript scenes & TSX components
│   ├── project.ts                # Default Motion Canvas project entry
│   └── vite-env.d.ts             # Vite TypeScript declarations
├── out/                          # Rendered outputs (.mp4, .png, metadata JSON)
├── SKILL.md                      # Comprehensive Agent Design Skill standard
└── package.json                  # Scripts & dependencies
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18+ 
- **Python**: 3.10+
- **FFmpeg**: Installed and available in PATH (or provided via `@motion-canvas/ffmpeg`)

### Installation

```bash
# Clone the repository
git clone https://github.com/phyroosh/MotionCanva.git
cd MotionCanva

# Install Node dependencies
npm install

# Install Python requirements for voice, podcast extraction, and thumbnail audits
pip install edge-tts numpy pillow youtube-transcript-api yt-dlp
```

---

## 💻 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run serve` | Starts Motion Canvas UI at `http://localhost:9000/` with multi-project selector & toolbar buttons |
| `npm run build` | Compiles project for production distribution |
| `npm run podcast -- --url "<URL>"` | Extracts high-impact reel topics from a podcast & stores in queue |
| `npm run queue` | Displays full topic queue status (pending, in-progress, completed) |
| `npm run queue:pending` | Lists pending uncompleted topics available for reel creation |
| `npm run script -- --topic "<Topic>"` | Generates a 10/10 veteran script with visual cues & loop syntax |
| `npm run script:lint <path_to_script>` | Runs the automated Script Hygiene Audit & Linter |
| `npm run thumbnail:director -- --topic "<Topic>"` | Evaluates thumbnail concepts and outputs director manifest |
| `npm run thumbnail <slug>` | Renders 1080×1920 high-contrast thumbnail |
| `npm run thumbnail:validate` | Runs Mobile Survival & Gaussian Blur optical physics tests |
| `npm run meta` | Generates viral YouTube Shorts metadata (titles, descriptions, tags) |
| `npm run export:rightclips <slug>` | Exports `.mp4`, thumbnail, and metadata to RightClips |
| `npm run publish:yt <slug>` | Directly uploads video to YouTube via Data API v3 |

---

## 🎨 UI Controls

1. Open `http://localhost:9000/` to browse all saved projects.
2. Select any project to load the interactive visual timeline.
3. In the bottom playback toolbar:
   - Click **RENDER** to trigger automated FFmpeg rendering directly to `out/<slug>.mp4`.
   - Click **EXPORT TO RIGHTCLIPS** to sync the finished project to RightClips Studio (`SYNCED ✅`).

---

## 📄 License

MIT License. Crafted for high-performance motion design and automated video intelligence.
