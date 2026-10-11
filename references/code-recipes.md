# Production Motion Design Code Recipes (TypeScript)

This reference provides copy-pasteable, production-hardened Motion Canvas components and animation choreography blocks.

---

## Recipe 1: Kinetic Masked Headline with Word Stagger

Never spawn a title all at once. Wrap words into masked clip containers so each word rises smoothly from beneath the floorline.

```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {all, sequence, createRefArray, easeOutExpo, delay} from '@motion-canvas/core';
import {Layout, Rect, Txt} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  const words = [
    {text: 'Deterministic', highlight: false},
    {text: 'State', highlight: false},
    {text: 'Verification', highlight: true},
  ];

  const wordRefs = createRefArray<Txt>();
  const container = createRef<Layout>();

  view.add(
    <Layout
      ref={container}
      layout={true}
      direction="row"
      gap={20}
      alignItems="center"
      justifyContent="center"
    >
      {words.map((item, i) => (
        <Rect clip={true} height={85}>
          <Txt
            ref={wordRefs}
            text={item.text}
            fontFamily="Inter"
            fontWeight={800}
            fontSize={64}
            letterSpacing={-1.5}
            fill={item.highlight ? '#6366F1' : '#F8FAFC'}
            y={100} // Hidden below clip baseline
            opacity={0}
          />
        </Rect>
      ))}
    </Layout>
  );

  // Staggered upward slide
  yield* sequence(
    0.09,
    ...wordRefs.map(word =>
      all(
        word.y(0, 0.85, easeOutExpo),
        word.opacity(1, 0.45, easeOutExpo),
      )
    ),
  );
});
```

---

## Recipe 2: Live Telemetry Card with Animated Sparkline

A card with a real-time counting metric, pulsating live indicator, and an animated vector sparkline.

```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  createRef,
  createSignal,
  easeOutBack,
  easeInOutCubic,
  easeInOutExpo,
  easeOutExpo,
} from '@motion-canvas/core';
import {Rect, Txt, Line, Circle, Layout} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  const tpsSignal = createSignal(0);
  const cardRef = createRef<Rect>();
  const sparklineRef = createRef<Line>();
  const liveDot = createRef<Circle>();

  view.add(
    <Rect
      ref={cardRef}
      width={520}
      height={280}
      radius={20}
      fill="rgba(18, 20, 29, 0.85)"
      stroke="#23273A"
      lineWidth={1.5}
      shadowColor="rgba(0, 0, 0, 0.5)"
      shadowBlur={30}
      shadowOffset={[0, 14]}
      scale={0.8}
      opacity={0}
    >
      {/* Top Header Pill */}
      <Layout
        layout={true}
        direction="row"
        alignItems="center"
        gap={10}
        position={[-180, -95]}
      >
        <Circle
          ref={liveDot}
          size={10}
          fill="#10B981"
          shadowColor="rgba(16, 185, 129, 0.5)"
          shadowBlur={16}
        />
        <Txt
          text="TELEMETRY STREAM"
          fontFamily="JetBrains Mono"
          fontSize={13}
          letterSpacing={2}
          fill="#94A3B8"
        />
      </Layout>

      {/* Main Dynamic Counter */}
      <Txt
        position={[-40, -25]}
        text={() => `${Math.floor(tpsSignal()).toLocaleString()} op/s`}
        fontFamily="Inter"
        fontWeight={800}
        fontSize={48}
        letterSpacing={-1}
        fill="#F8FAFC"
      />

      {/* Self-Drawing Vector Sparkline */}
      <Line
        ref={sparklineRef}
        points={[
          [-210, 80],
          [-140, 50],
          [-70, 70],
          [0, 20],
          [70, 45],
          [140, -10],
          [210, 15],
        ]}
        stroke="#6366F1"
        lineWidth={3.5}
        radius={18}
        lineCap="round"
        shadowColor="rgba(99, 102, 241, 0.35)"
        shadowBlur={20}
        end={0}
      />
    </Rect>
  );

  // 1. Entrance of Card
  yield* all(
    cardRef().scale(1, 0.7, easeOutBack),
    cardRef().opacity(1, 0.4, easeOutExpo),
  );

  // 2. Metric Counter + Sparkline Drawing in unison
  yield* all(
    tpsSignal(84920, 2.0, easeInOutExpo),
    sparklineRef().end(1, 1.8, easeInOutCubic),
  );
});
```

---

## Recipe 3: Distributed Network Flow (Packets on Bezier Pathways)

Visualizing nodes exchanging data packets along animated vector tracks.

```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  sequence,
  createRef,
  createSignal,
  easeOutBack,
  easeInOutCubic,
  easeOutExpo,
  Vector2,
} from '@motion-canvas/core';
import {Node, Rect, Circle, Line, Txt} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  const masterContainer = createRef<Node>();
  const lineA = createRef<Line>();
  const lineB = createRef<Line>();
  const packetPos = createSignal(0);

  const nodeA = createRef<Rect>();
  const nodeB = createRef<Rect>();
  const nodeC = createRef<Rect>();

  view.add(
    <Node ref={masterContainer}>
      {/* Edges */}
      <Line
        ref={lineA}
        points={[[-350, 0], [0, -120]]}
        stroke="#2A3042"
        lineWidth={2}
        radius={20}
        end={0}
      />
      <Line
        ref={lineB}
        points={[[-350, 0], [0, 120]]}
        stroke="#2A3042"
        lineWidth={2}
        radius={20}
        end={0}
      />

      {/* Nodes */}
      <Rect
        ref={nodeA}
        position={[-350, 0]}
        size={[160, 60]}
        radius={12}
        fill="#12141D"
        stroke="#434A6A"
        lineWidth={1.5}
        scale={0}
      >
        <Txt text="INGEST" fontFamily="JetBrains Mono" fontSize={14} fill="#F8FAFC" />
      </Rect>

      <Rect
        ref={nodeB}
        position={[0, -120]}
        size={[160, 60]}
        radius={12}
        fill="#12141D"
        stroke="#2A3042"
        lineWidth={1.5}
        scale={0}
      >
        <Txt text="ROUTER 01" fontFamily="JetBrains Mono" fontSize={14} fill="#94A3B8" />
      </Rect>

      <Rect
        ref={nodeC}
        position={[0, 120]}
        size={[160, 60]}
        radius={12}
        fill="#12141D"
        stroke="#2A3042"
        lineWidth={1.5}
        scale={0}
      >
        <Txt text="ROUTER 02" fontFamily="JetBrains Mono" fontSize={14} fill="#94A3B8" />
      </Rect>

      {/* Traveling Data Packet Dot */}
      <Circle
        size={14}
        fill="#06B6D4"
        shadowColor="rgba(6, 182, 212, 0.6)"
        shadowBlur={18}
        position={() =>
          Vector2.lerp(
            new Vector2(-350, 0),
            new Vector2(0, -120),
            packetPos(),
          )
        }
        opacity={() => (packetPos() > 0 && packetPos() < 1 ? 1 : 0)}
      />
    </Node>
  );

  // 1. Reveal nodes with spring pop
  yield* sequence(
    0.1,
    nodeA().scale(1, 0.6, easeOutBack),
    nodeB().scale(1, 0.6, easeOutBack),
    nodeC().scale(1, 0.6, easeOutBack),
  );

  // 2. Draw connecting paths
  yield* all(
    lineA().end(1, 0.8, easeOutExpo),
    lineB().end(1, 0.8, easeOutExpo),
  );

  // 3. Dispatch data packet along line A
  yield* packetPos(1, 1.1, easeInOutCubic);
});
```

---

## Recipe 4: Spatial Context Transition (Morph / Tuck to HUD)

Instead of cutting to black, the primary focal card from Act 1 scales down and glides smoothly into the top-left HUD corner to make room for Act 2.

```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, easeOutExpo} from '@motion-canvas/core';
import {Rect, Txt} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  const act1Card = createRef<Rect>();
  const act2Card = createRef<Rect>();

  view.add(
    <>
      <Rect
        ref={act1Card}
        position={[0, 0]}
        size={[700, 400]}
        radius={20}
        fill="#12141D"
        stroke="#6366F1"
        lineWidth={2}
      >
        <Txt text="PRIMARY SYSTEM MODEL" fill="#F8FAFC" fontSize={32} />
      </Rect>

      <Rect
        ref={act2Card}
        position={[0, 80]}
        size={[850, 480]}
        radius={20}
        fill="#12141D"
        stroke="#2A3042"
        lineWidth={1.5}
        y={400}
        opacity={0}
      >
        <Txt text="DETAILED PIPELINE BREAKDOWN" fill="#F8FAFC" fontSize={32} />
      </Rect>
    </>
  );

  // TRANSITION: Act 1 card shrinks & docks into HUD corner, Act 2 card slides in
  yield* all(
    act1Card().position([-600, -420], 1.2, easeInOutCubic),
    act1Card().size([320, 100], 1.2, easeInOutCubic),
    act1Card().stroke('#23273A', 1.2, easeInOutCubic),
    act2Card().position([0, 80], 1.2, easeOutExpo),
    act2Card().opacity(1, 0.8, easeOutExpo),
  );
});
```

---

## Recipe 5: Short-Form Vertical (9:16) 3-Tier Architecture

Production layout for 1080×1920 vertical format (YouTube Shorts / Instagram Reels / TikTok). Avoids the platform danger zones while providing a high-retention 3-tier visual hierarchy.

```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  sequence,
  waitFor,
  createRef,
  createSignal,
  easeOutBack,
  easeOutExpo,
  easeInOutCubic,
} from '@motion-canvas/core';
import {Rect, Txt, Layout, Circle, Line} from '@motion-canvas/2d';

export default makeScene2D(function* (view) {
  // Set vertical background
  view.fill('#08090D');

  const pillRef = createRef<Rect>();
  const titleRef = createRef<Txt>();
  const heroCard = createRef<Rect>();
  const metricSignal = createSignal(0);
  const sparklineRef = createRef<Line>();
  const captionRef = createRef<Txt>();

  view.add(
    <>
      {/* ============================================================== */}
      {/* TIER 1: TOP HOOK BANNER (Y = -460 to -340)                      */}
      {/* ============================================================== */}
      <Layout
        position={[0, -420]}
        layout={true}
        direction="column"
        alignItems="center"
        gap={16}
      >
        <Rect
          ref={pillRef}
          height={38}
          radius={999}
          fill="rgba(18, 20, 29, 0.9)"
          stroke="#23273A"
          lineWidth={1.5}
          padding={[0, 20]}
          layout={true}
          alignItems="center"
          scale={0.8}
          opacity={0}
        >
          <Txt
            text="ZERO-KNOWLEDGE // PROOF SYSTEM"
            fontFamily="JetBrains Mono"
            fontSize={13}
            letterSpacing={2}
            fill="#94A3B8"
          />
        </Rect>

        <Txt
          ref={titleRef}
          text="How to Verify Without Revealing"
          fontFamily="Inter"
          fontWeight={800}
          fontSize={44}
          letterSpacing={-1}
          fill="#F8FAFC"
          opacity={0}
          y={30}
        />
      </Layout>

      {/* ============================================================== */}
      {/* TIER 2: CENTER HERO VECTOR STAGE (Y = -200 to +240)            */}
      {/* ============================================================== */}
      <Rect
        ref={heroCard}
        position={[0, 20]}
        width={820}
        height={540}
        radius={24}
        fill="rgba(16, 18, 27, 0.85)"
        stroke="#23273A"
        lineWidth={1.5}
        shadowColor="rgba(0, 0, 0, 0.6)"
        shadowBlur={40}
        scale={0.85}
        opacity={0}
      >
        <Layout
          position={[0, -140]}
          layout={true}
          direction="column"
          alignItems="center"
          gap={8}
        >
          <Txt
            text="VERIFICATION LATENCY"
            fontFamily="JetBrains Mono"
            fontSize={14}
            letterSpacing={2.5}
            fill="#94A3B8"
          />
          <Txt
            text={() => `${metricSignal().toFixed(1)} ms`}
            fontFamily="Inter"
            fontWeight={800}
            fontSize={64}
            letterSpacing={-2}
            fill="#6366F1" // Electric Indigo Accent
          />
        </Layout>

        {/* Vector Curve */}
        <Line
          ref={sparklineRef}
          position={[0, 100]}
          points={[
            [-320, 60],
            [-160, 20],
            [0, -40],
            [160, -10],
            [320, -70],
          ]}
          stroke="#06B6D4"
          lineWidth={4}
          radius={24}
          lineCap="round"
          shadowColor="rgba(6, 182, 212, 0.4)"
          shadowBlur={24}
          end={0}
        />
      </Rect>

      {/* ============================================================== */}
      {/* TIER 3: BOTTOM KINETIC CAPTION ANCHOR (Y = +360 to +480)        */}
      {/* ============================================================== */}
      <Rect
        position={[0, 420]}
        width={820}
        height={90}
        radius={16}
        fill="rgba(18, 20, 29, 0.7)"
        stroke="#23273A"
        lineWidth={1.5}
        layout={true}
        alignItems="center"
        justifyContent="center"
      >
        <Txt
          ref={captionRef}
          text="Instant cryptographic proof verified."
          fontFamily="Inter"
          fontWeight={700}
          fontSize={30}
          letterSpacing={-0.5}
          fill="#F8FAFC"
          opacity={0}
        />
      </Rect>
    </>
  );

  // Frame 0: Immediate Hook Entrance (Never leave frame blank)
  yield* all(
    pillRef().scale(1, 0.6, easeOutBack),
    pillRef().opacity(1, 0.4, easeOutExpo),
    titleRef().y(0, 0.7, easeOutExpo),
    titleRef().opacity(1, 0.5, easeOutExpo),
  );

  // Hero Stage Reveal + Data Tween
  yield* all(
    heroCard().scale(1, 0.8, easeOutBack),
    heroCard().opacity(1, 0.5, easeOutExpo),
    metricSignal(4.8, 1.8, easeInOutCubic),
    sparklineRef().end(1, 1.5, easeInOutCubic),
  );

  // Bottom Kinetic Speech Caption Sync
  yield* all(
    captionRef().opacity(1, 0.4, easeOutExpo),
  );

  yield* waitFor(1.5);
});
```

---

## Recipe 6: Microsoft Edge Neural Voiceover & Cue Synchronization

How to generate voiceover with `scripts/generate_voice.py` (using `en-US-AvaMultilingualNeural`) and bind it to Motion Canvas.

### Step 1: Generate Voiceover via CLI
```bash
python3 scripts/generate_voice.py \
  "Zero-knowledge proofs allow you to prove state truth without revealing underlying private inputs." \
  --output src/audio.mp3 \
  --cues src/voice_cues.json
```

This outputs `src/audio.mp3` and a structured `src/voice_cues.json`:
```json
{
  "voice": "en-US-AvaMultilingualNeural",
  "total_duration": 5.42,
  "cues": [
    {
      "text": "Zero-knowledge proofs allow you to prove state truth without revealing underlying private inputs.",
      "start": 0.05,
      "duration": 5.37,
      "end": 5.42
    }
  ]
}
```

### Step 2: Bind Audio in `src/project.ts`
```typescript
import {makeProject} from '@motion-canvas/core';
import scene from './scenes/short_showcase?scene';
import audio from './audio.mp3';

export default makeProject({
  scenes: [scene],
  audio, // Binds audio waveform to Motion Canvas editor & timeline
});
```

### Step 3: Synchronize Scene Animation Duration
Inside your scene generator, match the animation steps to the cue duration:
```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {all, waitFor, createRef, easeOutExpo, easeInOutCubic} from '@motion-canvas/core';
import {Txt, Rect} from '@motion-canvas/2d';
import voiceData from '../voice_cues.json';

export default makeScene2D(function* (view) {
  const cue = voiceData.cues[0]; // duration: 5.37s

  // Act 1: Hook matches initial 1.5s
  yield* all(
    title().y(0, 0.8, easeOutExpo),
    title().opacity(1, 0.5),
  );

  // Act 2: Main data & vector transition runs for remainder of cue
  yield* all(
    metricSignal(100, 2.8, easeInOutCubic),
    graphLine().end(1, 2.5, easeInOutCubic),
  );

  // Settle until speech completes:
  yield* waitFor(cue.end - 3.3);
});
```

