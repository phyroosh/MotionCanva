# Motion Design System & Aesthetic Tokens

This reference defines the strict mathematical and visual design tokens for building Minimalist 2D Vector Animations in Motion Canvas.

---

## 1. Curated Color Palettes

Never invent random RGB values. Choose one unified palette per video or visual theme.

### Palette 1: Cyber-Zinc & Electric Indigo (Default / High-Tech Architecture)
*Ideal for distributed systems, software engineering, modern infrastructure, and protocols.*

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `bg.canvas` | `#08090D` | Base Viewport | Scene background |
| `surface.card` | `rgba(18, 20, 29, 0.75)` | Frosted Container | Data cards, HUD panels, dialogue boxes |
| `surface.elevated` | `#1C2030` | Hover / Active Tile | Selected nodes, status chips |
| `border.subtle` | `#23273A` | Structural Grid | 1px grid lines, card borders |
| `border.active` | `#434A6A` | Emphasized Border | Active card perimeter |
| `text.primary` | `#F8FAFC` | High Contrast | Hero titles, primary figures |
| `text.muted` | `#94A3B8` | Low Contrast | Subtitles, descriptions, grid labels |
| `text.dim` | `#64748B` | Background Text | Timestamps, footnote metadata |
| `accent.primary` | `#6366F1` | Electric Indigo | Active nodes, primary curves, focal keywords |
| `accent.glow` | `rgba(99, 102, 241, 0.25)` | Ambient Glow | `shadowColor` for active vector curves |
| `accent.secondary` | `#818CF8` | Soft Lavender | Secondary highlights, gradient stops |

### Palette 2: Midnight Abyss & Radiant Cyan (Fintech, Real-Time Streams, Quantum)
*Ideal for high-throughput pipelines, encryption, transaction ledgers, and telemetry.*

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `bg.canvas` | `#050811` | Obsidian Abyss | Scene background |
| `surface.card` | `rgba(10, 18, 36, 0.8)` | Oceanic Slate | Component containers |
| `border.subtle` | `#1E2C4A` | Grid Lines | Subtle 1px dividers |
| `text.primary` | `#F0FDF4` | Crisp Terminal White | Main metrics |
| `text.muted` | `#7DD3FC` | Muted Ice | Context labels |
| `accent.primary` | `#06B6D4` | Laser Cyan | Stream vectors, signal beacons |
| `accent.glow` | `rgba(6, 182, 212, 0.3)` | Cyan Halo | Glowing rings, beam trails |

### Palette 3: Pure Minimalist Monolith (Editorial, Philosophy, Mathematics)
*Ideal for algorithms, mathematical proofs, logic trees, and fundamental principles.*

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `bg.canvas` | `#0A0A0A` | Pitch Black | Minimalist canvas |
| `surface.card` | `#141414` | Solid Dark Charcoal | Cards & bounding boxes |
| `border.subtle` | `#262626` | Hairline | Minimalist borders |
| `text.primary` | `#FFFFFF` | Stark White | Headlines |
| `text.muted` | `#A3A3A3` | Neutral Gray | Explanatory text |
| `accent.primary` | `#F59E0B` | Warm Amber | Highlight proofs, active mathematical step |
| `accent.glow` | `rgba(245, 158, 11, 0.2)` | Amber Aura | Core insight highlight |

---

## 2. Typographic Scale & Rules

Typography must guide the viewer's eye with razor-sharp intent.

### Fonts
- **Primary Sans**: `"Inter"`, `"-apple-system"`, `"BlinkMacSystemFont"`, `"SF Pro Display"`, `"sans-serif"`
- **Monospace Code/Data**: `"JetBrains Mono"`, `"Fira Code"`, `"SF Mono"`, `"monospace"`

### Type Scale Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Max Words | Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Display.Hero` | 72px | 800 (ExtraBold) | 1.1 | -1.5px | 3–5 | Thesis statement, central breakthrough |
| `Display.Title` | 48px | 700 (Bold) | 1.15 | -1.0px | 4–7 | Section title, component name |
| `Display.Subtitle` | 26px | 500 (Medium) | 1.3 | -0.3px | 8–12 | Secondary explainer sentence |
| `Data.Metric` | 56px | 800 (ExtraBold) | 1.0 | -1.0px | 1 (Number) | Dynamic counters, percentages, speeds |
| `Badge.Label` | 14px | 600 (SemiBold) | 1.0 | 2.0px | 1–2 | UPPERCASE category pills (`CONSENSUS`, `VERIFIED`) |
| `Code.Body` | 18px | 500 (Medium) | 1.4 | 0px | 1–3 lines | Code expressions, formula variables |

### Rules for Kinetic Typography:
1. **Never use more than 7 words on a single line.** Motion Canvas is dynamic cinema, not a PDF document.
2. **Always pair high-contrast keywords with muted connective words.**
   - Example: *"Zero-Knowledge"* in `#6366F1` (Bold), *"Proof Generation"* in `#F8FAFC`.
3. **Always use masked clip containers (`clip={true}`)** for rising typography so characters do not pop out of thin air.

---

## 3. Geometric Tokens & Stroke Physics

### Border Radii
- `radius.pill`: `999` (Status pills, interactive tokens, badges)
- `radius.lg`: `20` (Primary data cards, layout containers)
- `radius.md`: `12` (Nested cards, sub-panels)
- `radius.sm`: `6` (Inner tags, micro-indicators)

### Stroke Widths
- `hairline`: `1` (Background coordinate grids, subtle division lines)
- `border`: `1.5` (Standard card borders, bounding boxes)
- `vector.normal`: `2.5` (Connecting graph edges, flow pathways)
- `vector.hero`: `4` to `6` (Active animated bezier trajectories, hero sparklines)

### Shadows & Glows
In 2D vector animation, shadows should not simulate real-world sun angles. They should simulate **subtle self-illumination (luminescence)**:
```typescript
// Subdued card depth:
shadowColor="rgba(0, 0, 0, 0.45)"
shadowBlur={32}
shadowOffset={[0, 16]}

// Electric active glow:
shadowColor="rgba(99, 102, 241, 0.35)"
shadowBlur={36}
shadowOffset={[0, 0]} // Centered ambient bloom
```

---

## 4. Canvas Coordinate Blueprint

All coordinates are centered around `(0, 0)`:

```
(-960, -540) ------------------- (0, -540) ------------------- (960, -540)
     |                                                              |
     |        Safe Zone: [-800, -450] to [800, 450]                 |
     |                                                              |
(-960, 0) ----------------------- (0, 0) ----------------------- (960, 0)
     |                          CENTER                              |
     |                                                              |
     |                                                              |
(-960, 540) -------------------- (0, 540) -------------------- (960, 540)
```

- **Top HUD / Header Region**: `Y = -420` to `-480`
- **Main Hero Action Zone**: `Y = -250` to `+250`, `X = -750` to `+750`
- **Bottom Status / Timeline Bar**: `Y = +420` to `+480`
- **Left/Right Split Layout**:
  - Left Panel: `X = -420`, `width = 720`
  - Right Panel: `X = +420`, `width = 720`
  - Central Divider / Pathway: `X = 0`

---

## 5. Short-Form Video Blueprint (9:16 Vertical / Shorts / Reels / TikTok)

Short-form videos require a dedicated vertical coordinate space and strict UI overlay avoidance.

### Viewport Dimensions
- **Resolution**: `1080 × 1920` (9:16 aspect ratio)
- **Center**: `(0, 0)`
- **Boundaries**: X is `[-540, 540]`, Y is `[-960, 960]`. Positive Y goes DOWN.

### Platform Overlay Danger Zones & Safe Core
Social media platforms (YouTube Shorts, Instagram Reels, TikTok) render heavy UI elements over vertical video:
- **Top Danger Zone (`Y < -620`)**: Search headers, sound names, front-camera notch. Avoid placing crucial text or focal objects here.
- **Right Action Stack (`X > 380`, `Y = -200` to `+500`)**: Like, comment, share, remix, and sound disc icons. Keep all graphics and text indented left of `X = 360`.
- **Bottom Danger Zone (`Y > +540`)**: Account handle, video description, caption box, comment CTA, sound title ticker.
- **Guaranteed Safe Core**: `X = [-460, 360]`, `Y = [-580, +500]` (Width ~820px, Height ~1080px).

```
(-540, -960) ------------------- (0, -960) ------------------- (540, -960)
     |                     [TOP DANGER ZONE]                        |
     | ------------------------------------------------------------ |
     |                                                      | RIGHT |
     |       TIER 1: Hook / Category Banner                 | ICONS |
     |       (Y = -480 to -340)                             | STACK |
     |                                                      |       |
     |       TIER 2: Hero Vector Stage                      | D     |
     |       (Y = -200 to +240)                             | A     |
     |       [Cards, Graphs, Diagrams, Living Data]         | N     |
     |                                                      | G     |
     |       TIER 3: Kinetic Captions & Telemetry Anchor    | E     |
     |       (Y = +320 to +480)                             | R     |
     |                                                      |       |
     | ------------------------------------------------------------ |
     |                    [BOTTOM DANGER ZONE]                      |
(-540, 960) -------------------- (0, 960) -------------------- (540, 960)
```

### The 3-Tier Vertical Stack Architecture

1. **Tier 1: Hook & Topic Banner (`Y = -480` to `-340`)**:
   - Monospace category pill: `padding={[6, 18]}`, `radius={999}`, `fill="rgba(18, 20, 29, 0.85)"`, `fontSize={14}`.
   - High-impact thesis title: 2–4 lines maximum, 48px–56px bold typography.
2. **Tier 2: Hero Vector Stage (`Y = -200` to `+240`)**:
   - The primary visual actor: 760px–840px wide frosted card (`radius={22}`), interactive node flow, or animated counter dial.
   - Center of all motion physics and vector morphing.
3. **Tier 3: Kinetic Captions & Telemetry Anchor (`Y = +320` to `+480`)**:
   - Living speech sync captions: 36px–42px bold font, active word highlighted in electric accent color (`#6366F1` or `#06B6D4`), secondary words in silver/slate.
   - Micro-telemetry chips: `latency: 12ms`, `hash: 0x9f4a...`, `status: VERIFIED`.

