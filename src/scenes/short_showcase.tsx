import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  sequence,
  waitFor,
  createRef,
  createRefArray,
  createSignal,
  easeOutBack,
  easeOutExpo,
  easeInOutCubic,
  easeInOutExpo,
  Vector2,
} from '@motion-canvas/core';
import {
  Node,
  Layout,
  Rect,
  Circle,
  Txt,
  Line,
  Grid,
} from '@motion-canvas/2d';
import voiceData from '../voice_cues.json';

export default makeScene2D(function* (view) {
  // ---------------------------------------------------------------------------
  // 1. SIGNALS & REFS (Vertical 1080x1920)
  // ---------------------------------------------------------------------------
  const cue0 = voiceData.cues[0]; // ~7.14s
  const cue1 = voiceData.cues[1]; // ~4.20s

  const metricSignal = createSignal(0);
  const packetPos = createSignal(0);
  const captionIndex = createSignal(0);

  // Structural Refs
  const gridRef = createRef<Grid>();
  const topPill = createRef<Rect>();
  const titleText = createRef<Txt>();
  
  // Hero Stage Refs
  const heroCard = createRef<Rect>();
  const sparkline = createRef<Line>();
  const edgeA = createRef<Line>();
  const edgeB = createRef<Line>();
  const node1 = createRef<Rect>();
  const node2 = createRef<Rect>();
  const node3 = createRef<Rect>();
  const statusPill = createRef<Rect>();
  const livePulse = createRef<Circle>();

  // Caption Refs
  const captionCard = createRef<Rect>();
  const captionWord1 = createRef<Txt>();
  const captionWord2 = createRef<Txt>();

  // ---------------------------------------------------------------------------
  // 2. VERTICAL VIEWPORT SETUP (9:16)
  // ---------------------------------------------------------------------------
  view.fill('#08090D'); // Cyber-Zinc background

  view.add(
    <>
      {/* Subtle Coordinate Grid */}
      <Grid
        ref={gridRef}
        width={1080}
        height={1920}
        spacing={72}
        stroke="#131622"
        lineWidth={1}
        opacity={0}
      />

      {/* ============================================================== */}
      {/* TIER 1: TOP HOOK BANNER (Y = -480 to -340)                      */}
      {/* ============================================================== */}
      <Layout
        position={[0, -420]}
        layout={true}
        direction="column"
        alignItems="center"
        gap={14}
      >
        <Rect
          ref={topPill}
          height={36}
          radius={999}
          fill="rgba(18, 20, 29, 0.9)"
          stroke="#23273A"
          lineWidth={1.5}
          padding={[0, 18]}
          layout={true}
          alignItems="center"
          scale={0.8}
          opacity={0}
        >
          <Txt
            text="CRYPTOGRAPHIC PROOF // v3.2"
            fontFamily="JetBrains Mono"
            fontSize={12}
            letterSpacing={2}
            fill="#94A3B8"
          />
        </Rect>

        <Rect clip={true} height={60}>
          <Txt
            ref={titleText}
            text="Zero-Knowledge Consensus"
            fontFamily="Inter"
            fontWeight={800}
            fontSize={44}
            letterSpacing={-1.5}
            fill="#F8FAFC"
            y={80}
            opacity={0}
          />
        </Rect>
      </Layout>

      {/* ============================================================== */}
      {/* TIER 2: CENTER HERO VECTOR STAGE (Y = -200 to +240)            */}
      {/* ============================================================== */}
      <Rect
        ref={heroCard}
        position={[0, 20]}
        width={800}
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
        {/* Top Header inside card */}
        <Layout
          position={[-230, -210]}
          layout={true}
          direction="row"
          alignItems="center"
          gap={10}
        >
          <Circle
            ref={livePulse}
            size={10}
            fill="#10B981"
            shadowColor="rgba(16, 185, 129, 0.6)"
            shadowBlur={16}
          />
          <Txt
            text="STATE VERIFIER"
            fontFamily="JetBrains Mono"
            fontSize={13}
            letterSpacing={2}
            fill="#94A3B8"
          />
        </Layout>

        {/* Dynamic Metric Display */}
        <Txt
          position={[-180, -130]}
          text={() => `${metricSignal().toFixed(1)}%`}
          fontFamily="Inter"
          fontWeight={800}
          fontSize={64}
          letterSpacing={-2}
          fill="#6366F1"
          shadowColor="rgba(99, 102, 241, 0.4)"
          shadowBlur={28}
        />

        <Txt
          position={[-180, -70]}
          text="Cryptographic Finality"
          fontFamily="Inter"
          fontSize={16}
          fill="#64748B"
        />

        {/* Network Nodes Topology */}
        <Node position={[120, -110]}>
          <Line
            ref={edgeA}
            points={[[-100, -30], [80, -30]]}
            stroke="#2A3042"
            lineWidth={2}
            end={0}
          />
          <Rect
            ref={node1}
            position={[-100, -30]}
            size={[80, 40]}
            radius={8}
            fill="#12141D"
            stroke="#434A6A"
            lineWidth={1.5}
            scale={0}
          >
            <Txt text="STATE" fontFamily="JetBrains Mono" fontSize={11} fill="#F8FAFC" />
          </Rect>
          <Rect
            ref={node2}
            position={[80, -30]}
            size={[80, 40]}
            radius={8}
            fill="#12141D"
            stroke="#6366F1"
            lineWidth={1.5}
            scale={0}
          >
            <Txt text="PROOF" fontFamily="JetBrains Mono" fontSize={11} fill="#6366F1" />
          </Rect>

          {/* Traveling Data Packet */}
          <Circle
            size={12}
            fill="#06B6D4"
            shadowColor="rgba(6, 182, 212, 0.7)"
            shadowBlur={18}
            position={() => Vector2.lerp(new Vector2(-100, -30), new Vector2(80, -30), packetPos())}
            opacity={() => (packetPos() > 0 && packetPos() < 1 ? 1 : 0)}
          />
        </Node>

        {/* Bottom Vector Sparkline */}
        <Line
          ref={sparkline}
          position={[0, 140]}
          points={[
            [-320, 60],
            [-160, 20],
            [0, 40],
            [160, -30],
            [320, -60],
          ]}
          stroke="#06B6D4"
          lineWidth={4}
          radius={22}
          lineCap="round"
          shadowColor="rgba(6, 182, 212, 0.35)"
          shadowBlur={20}
          end={0}
        />
      </Rect>

      {/* ============================================================== */}
      {/* TIER 3: BOTTOM KINETIC CAPTION ANCHOR (Y = +360 to +480)        */}
      {/* ============================================================== */}
      <Rect
        ref={captionCard}
        position={[0, 440]}
        width={800}
        height={92}
        radius={18}
        fill="rgba(18, 20, 29, 0.85)"
        stroke="#23273A"
        lineWidth={1.5}
        shadowColor="rgba(0, 0, 0, 0.4)"
        shadowBlur={24}
        layout={true}
        direction="column"
        alignItems="center"
        justifyContent="center"
        padding={[12, 24]}
        opacity={0}
      >
        <Txt
          ref={captionWord1}
          text="Zero-knowledge proofs verify state transformations"
          fontFamily="Inter"
          fontWeight={700}
          fontSize={26}
          letterSpacing={-0.5}
          fill="#F8FAFC"
        />
        <Txt
          ref={captionWord2}
          text="without revealing underlying private data."
          fontFamily="Inter"
          fontWeight={600}
          fontSize={22}
          letterSpacing={-0.3}
          fill="#94A3B8"
        />
      </Rect>
    </>
  );

  // ---------------------------------------------------------------------------
  // 3. CHOREOGRAPHY (LOCKED TO VOICE CUES)
  // ---------------------------------------------------------------------------

  // CUE 0 (0.05s - 7.19s): "Zero-knowledge proofs allow systems..."
  // Frame 0: Instant Hook Entrance
  yield* all(
    gridRef().opacity(1, 1.0, easeInOutCubic),
    topPill().scale(1, 0.5, easeOutBack),
    topPill().opacity(1, 0.4, easeOutExpo),
    titleText().y(0, 0.7, easeOutExpo),
    titleText().opacity(1, 0.4, easeOutExpo),
    heroCard().scale(1, 0.8, easeOutBack),
    heroCard().opacity(1, 0.5, easeOutExpo),
    captionCard().opacity(1, 0.5, easeOutExpo),
  );

  // Mid-Cue 0: Network nodes appear & packet traverses
  yield* all(
    node1().scale(1, 0.5, easeOutBack),
    node2().scale(1, 0.5, easeOutBack),
    edgeA().end(1, 0.6, easeOutExpo),
    packetPos(1, 1.2, easeInOutCubic),
    metricSignal(65.4, 3.0, easeInOutExpo),
    sparkline().end(0.6, 2.5, easeInOutCubic),
  );

  // Hold remainder of Cue 0
  yield* waitFor(1.5);

  // CUE 1 (7.19s - 11.39s): "Real-time consensus achieves instant cryptographic finality."
  yield* all(
    // Update caption to match sentence 2
    captionWord1().text("Real-time consensus achieves", 0.3),
    captionWord1().fill("#6366F1", 0.3), // Highlight in electric indigo
    captionWord2().text("instant cryptographic finality.", 0.3),
    captionWord2().fill("#F8FAFC", 0.3),
    // Climax: Metric reaches 100% and sparkline finishes
    metricSignal(100.0, 2.5, easeInOutExpo),
    sparkline().end(1.0, 2.2, easeInOutCubic),
  );

  // Resolution hold
  yield* waitFor(1.2);
});
