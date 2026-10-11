import {makeScene2D} from '@motion-canvas/2d';
import {
  all,
  sequence,
  chain,
  waitFor,
  createRef,
  createRefArray,
  createSignal,
  easeOutExpo,
  easeInOutCubic,
  easeOutBack,
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

export default makeScene2D(function* (view) {
  // ---------------------------------------------------------------------------
  // 1. SIGNALS & REFS
  // ---------------------------------------------------------------------------
  const metricSignal = createSignal(0);
  const packetProgress = createSignal(0);

  // Structural Refs
  const gridRef = createRef<Grid>();
  const hudPill = createRef<Rect>();
  const titleContainer = createRef<Layout>();
  const titleWords = createRefArray<Txt>();
  
  // Data Card & Network Refs
  const cardRef = createRef<Rect>();
  const sparklineRef = createRef<Line>();
  const nodeA = createRef<Rect>();
  const nodeB = createRef<Rect>();
  const nodeC = createRef<Rect>();
  const connectionLine = createRef<Line>();
  const livePulse = createRef<Circle>();

  // ---------------------------------------------------------------------------
  // 2. VIEWPORT SETUP & HIERARCHY
  // ---------------------------------------------------------------------------
  view.fill('#08090D'); // Base Cyber-Zinc Canvas

  view.add(
    <>
      {/* Subtle Coordinate Grid (Hairline minimalism) */}
      <Grid
        ref={gridRef}
        width={1920}
        height={1080}
        spacing={80}
        stroke="#141724"
        lineWidth={1}
        opacity={0}
      />

      {/* Top HUD Badge */}
      <Rect
        ref={hudPill}
        position={[0, -420]}
        height={38}
        radius={999}
        fill="rgba(18, 20, 29, 0.85)"
        stroke="#23273A"
        lineWidth={1.5}
        padding={[0, 20]}
        layout={true}
        alignItems="center"
        justifyContent="center"
        scale={0.8}
        opacity={0}
      >
        <Txt
          text="PROTOCOL // HIGH-THROUGHPUT RUNTIME"
          fontFamily="JetBrains Mono"
          fontSize={12}
          letterSpacing={2.5}
          fill="#94A3B8"
        />
      </Rect>

      {/* Kinetic Headline with Masked Word Cliping */}
      <Layout
        ref={titleContainer}
        position={[0, -120]}
        layout={true}
        direction="row"
        gap={18}
        alignItems="center"
        justifyContent="center"
      >
        <Rect clip={true} height={85}>
          <Txt
            ref={titleWords}
            text="Autonomous"
            fontFamily="Inter"
            fontWeight={800}
            fontSize={68}
            letterSpacing={-1.5}
            fill="#F8FAFC"
            y={100}
            opacity={0}
          />
        </Rect>
        <Rect clip={true} height={85}>
          <Txt
            ref={titleWords}
            text="Consensus"
            fontFamily="Inter"
            fontWeight={800}
            fontSize={68}
            letterSpacing={-1.5}
            fill="#6366F1" // Electric Indigo Accent
            shadowColor="rgba(99, 102, 241, 0.4)"
            shadowBlur={28}
            y={100}
            opacity={0}
          />
        </Rect>
        <Rect clip={true} height={85}>
          <Txt
            ref={titleWords}
            text="Engine"
            fontFamily="Inter"
            fontWeight={800}
            fontSize={68}
            letterSpacing={-1.5}
            fill="#F8FAFC"
            y={100}
            opacity={0}
          />
        </Rect>
      </Layout>

      {/* Primary Data Card (Appears as title glides to header) */}
      <Rect
        ref={cardRef}
        position={[0, 160]}
        width={920}
        height={420}
        radius={22}
        fill="rgba(16, 18, 27, 0.8)"
        stroke="#23273A"
        lineWidth={1.5}
        shadowColor="rgba(0, 0, 0, 0.55)"
        shadowBlur={40}
        shadowOffset={[0, 20]}
        scale={0.85}
        opacity={0}
      >
        {/* Left Sub-Panel: Dynamic Living Counter */}
        <Layout
          position={[-230, -50]}
          layout={true}
          direction="column"
          alignItems="start"
          gap={8}
        >
          <Layout layout={true} direction="row" alignItems="center" gap={10}>
            <Circle
              ref={livePulse}
              size={10}
              fill="#10B981"
              shadowColor="rgba(16, 185, 129, 0.6)"
              shadowBlur={16}
            />
            <Txt
              text="VERIFIED TELEMETRY"
              fontFamily="JetBrains Mono"
              fontSize={13}
              letterSpacing={2}
              fill="#94A3B8"
            />
          </Layout>

          <Txt
            text={() => `${metricSignal().toFixed(1)}k ops/s`}
            fontFamily="Inter"
            fontWeight={800}
            fontSize={52}
            letterSpacing={-1.5}
            fill="#F8FAFC"
          />

          <Txt
            text="State finality achieved in 14.2ms"
            fontFamily="Inter"
            fontSize={16}
            fill="#64748B"
          />
        </Layout>

        {/* Self-Drawing Sparkline under metric */}
        <Line
          ref={sparklineRef}
          position={[-230, 95]}
          points={[
            [-160, 40],
            [-100, 15],
            [-40, 30],
            [20, -15],
            [80, 5],
            [160, -35],
          ]}
          stroke="#6366F1"
          lineWidth={3.5}
          radius={20}
          lineCap="round"
          shadowColor="rgba(99, 102, 241, 0.4)"
          shadowBlur={20}
          end={0}
        />

        {/* Right Sub-Panel: Distributed Flow Nodes */}
        <Node position={[230, 0]}>
          <Line
            ref={connectionLine}
            points={[
              [-120, -80],
              [0, 60],
              [120, -80],
            ]}
            stroke="#2A3042"
            lineWidth={2}
            radius={24}
            end={0}
          />

          <Rect
            ref={nodeA}
            position={[-120, -80]}
            size={[110, 48]}
            radius={10}
            fill="#12141D"
            stroke="#434A6A"
            lineWidth={1.5}
            scale={0}
          >
            <Txt text="PRODUCER" fontFamily="JetBrains Mono" fontSize={12} fill="#F8FAFC" />
          </Rect>

          <Rect
            ref={nodeB}
            position={[0, 60]}
            size={[110, 48]}
            radius={10}
            fill="#12141D"
            stroke="#6366F1"
            lineWidth={1.5}
            scale={0}
          >
            <Txt text="QUORUM" fontFamily="JetBrains Mono" fontSize={12} fill="#6366F1" />
          </Rect>

          <Rect
            ref={nodeC}
            position={[120, -80]}
            size={[110, 48]}
            radius={10}
            fill="#12141D"
            stroke="#434A6A"
            lineWidth={1.5}
            scale={0}
          >
            <Txt text="SETTLE" fontFamily="JetBrains Mono" fontSize={12} fill="#F8FAFC" />
          </Rect>

          {/* Traveling Data Packet */}
          <Circle
            size={12}
            fill="#06B6D4"
            shadowColor="rgba(6, 182, 212, 0.7)"
            shadowBlur={20}
            position={() => {
              const p = packetProgress();
              if (p <= 0.5) {
                return Vector2.lerp(new Vector2(-120, -80), new Vector2(0, 60), p * 2);
              } else {
                return Vector2.lerp(new Vector2(0, 60), new Vector2(120, -80), (p - 0.5) * 2);
              }
            }}
            opacity={() => (packetProgress() > 0 && packetProgress() < 1 ? 1 : 0)}
          />
        </Node>
      </Rect>
    </>
  );

  // ---------------------------------------------------------------------------
  // 3. CHOREOGRAPHY & MOTION EXECUTION
  // ---------------------------------------------------------------------------

  // Phase 1: Environment Initialization & Masked Headline Cascade
  yield* all(
    gridRef().opacity(1, 1.2, easeInOutCubic),
    hudPill().scale(1, 0.8, easeOutBack),
    hudPill().opacity(1, 0.5, easeOutExpo),
    sequence(
      0.1,
      ...titleWords.map(word =>
        all(
          word.y(0, 0.85, easeOutExpo),
          word.opacity(1, 0.4, easeOutExpo),
        )
      ),
    ),
  );

  yield* waitFor(0.6);

  // Phase 2: Spatial Transformation (Title docks upward, Data Card enters)
  yield* all(
    titleContainer().position([0, -320], 1.1, easeInOutCubic),
    titleContainer().scale(0.75, 1.1, easeInOutCubic),
    cardRef().scale(1, 1.0, easeOutBack),
    cardRef().opacity(1, 0.6, easeOutExpo),
  );

  // Phase 3: Data-in-Motion Activation (Telemetry Counter, Sparkline, Network Graph)
  yield* all(
    metricSignal(124.8, 2.2, easeInOutExpo),
    sparklineRef().end(1, 1.8, easeInOutCubic),
    sequence(
      0.12,
      nodeA().scale(1, 0.6, easeOutBack),
      nodeB().scale(1, 0.6, easeOutBack),
      nodeC().scale(1, 0.6, easeOutBack),
    ),
    connectionLine().end(1, 1.2, easeOutExpo),
  );

  // Phase 4: Active Data Packet Pulse
  yield* packetProgress(1, 1.4, easeInOutCubic);

  // Phase 5: Settle & Retention Pause
  yield* waitFor(1.5);
});
