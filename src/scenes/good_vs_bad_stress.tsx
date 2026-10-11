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
  easeInOutExpo,
  easeInCubic,
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
  // ===========================================================================
  // 1. TIMING & VOICE CUES (Total ~21.26s)
  // ===========================================================================
  const cue0 = voiceData.cues[0]; // 0.05s -> 2.225s  ("Not all stress is toxic.")
  const cue1 = voiceData.cues[1]; // 2.225s -> 10.275s ("Short bursts of acute stress...")
  const cue2 = voiceData.cues[2]; // 10.275s -> 17.300s ("The danger is chronic distress...")
  const cue3 = voiceData.cues[3]; // 17.300s -> 19.200s ("Stress isn't your enemy.")
  const cue4 = voiceData.cues[4]; // 19.200s -> 21.262s ("Unrecovered stress is.")

  // ===========================================================================
  // 2. SIGNALS & STATE
  // ===========================================================================
  const focusSignal = createSignal(0);
  const cortisolSignal = createSignal(1.0);
  const isCortisolMode = createSignal(false);
  const particleT = createSignal(0);
  const sineWaveProgress = createSignal(0);

  // Background Grid Ref
  const gridRef = createRef<Grid>();

  // Tier 1: Top Banner Refs
  const topPill = createRef<Rect>();
  const topPillTxt = createRef<Txt>();
  const titleText = createRef<Txt>();

  // Tier 2: Hero Stage Refs
  const heroCard = createRef<Rect>();
  const stageHeaderPill = createRef<Rect>();
  const stageHeaderTxt = createRef<Txt>();
  const statusPulseDot = createRef<Circle>();

  // Act 1: Spectrum Comparison Refs
  const spectrumNode = createRef<Node>();
  const eustressCard = createRef<Rect>();
  const distressCard = createRef<Rect>();
  const vsBadge = createRef<Rect>();
  const spectrumBar = createRef<Line>();
  const spectrumPointer = createRef<Circle>();

  // Act 2 & 3: Yerkes-Dodson Curve Refs
  const curveNode = createRef<Node>();
  const curveLine = createRef<Line>();
  const curveRedLine = createRef<Line>();
  const curveParticle = createRef<Circle>();
  const curveParticleRing = createRef<Circle>();
  const peakMarker = createRef<Node>();
  const focusMetricTxt = createRef<Txt>();
  const focusSubTxt = createRef<Txt>();
  const neuroBadgeA = createRef<Rect>();
  const neuroBadgeB = createRef<Rect>();
  const axisX = createRef<Line>();
  const axisY = createRef<Line>();
  const axisLabelX = createRef<Txt>();
  const axisLabelY = createRef<Txt>();

  // Act 4: Adaptation Formula Refs
  const formulaNode = createRef<Node>();
  const formulaCardA = createRef<Rect>();
  const formulaPlus = createRef<Txt>();
  const formulaCardB = createRef<Rect>();
  const formulaEqual = createRef<Txt>();
  const formulaCardC = createRef<Rect>();
  const formulaSubtext = createRef<Txt>();
  const sineWaveLine = createRef<Line>();

  // Tier 3: Kinetic Captions
  const captionCard = createRef<Rect>();
  const captionLine1 = createRef<Txt>();
  const captionLine2 = createRef<Txt>();

  // ===========================================================================
  // 3. VERTICAL VIEWPORT (1080 x 1920)
  // ===========================================================================
  view.fill('#08090D'); // Deep obsidian/cyber-zinc

  view.add(
    <>
      {/* Background Matrix Grid */}
      <Grid
        ref={gridRef}
        width={1080}
        height={1920}
        spacing={64}
        stroke="#121520"
        lineWidth={1}
        opacity={0}
      />

      {/* ================================================================== */}
      {/* TIER 1: TOP HOOK BANNER (Y = -430)                                 */}
      {/* ================================================================== */}
      <Layout
        position={[0, -430]}
        layout={true}
        direction="column"
        alignItems="center"
        gap={14}
      >
        <Rect
          ref={topPill}
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
            ref={topPillTxt}
            text="NEUROBIOLOGY // INSIGHT"
            fontFamily="JetBrains Mono"
            fontSize={12}
            letterSpacing={2}
            fill="#94A3B8"
          />
        </Rect>

        <Rect clip={true} height={60}>
          <Txt
            ref={titleText}
            text="Good Stress vs Bad Stress"
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

      {/* ================================================================== */}
      {/* TIER 2: HERO STAGE (Y = 15, 820 x 580)                              */}
      {/* ================================================================== */}
      <Rect
        ref={heroCard}
        position={[0, 15]}
        width={820}
        height={580}
        radius={24}
        fill="rgba(14, 16, 24, 0.92)"
        stroke="#23273A"
        lineWidth={1.5}
        shadowColor="rgba(0, 0, 0, 0.6)"
        shadowBlur={40}
        scale={0.85}
        opacity={0}
      >
        {/* Stage Header Status Pill */}
        <Layout
          position={[0, -235]}
          layout={true}
          direction="row"
          alignItems="center"
          gap={10}
        >
          <Circle
            ref={statusPulseDot}
            size={10}
            fill="#10B981"
            shadowColor="rgba(16, 185, 129, 0.6)"
            shadowBlur={16}
          />
          <Txt
            ref={stageHeaderTxt}
            text="STATE CLASSIFICATION"
            fontFamily="JetBrains Mono"
            fontSize={12}
            letterSpacing={2}
            fill="#94A3B8"
          />
        </Layout>

        {/* ---------------------------------------------------------------- */}
        {/* ACT 1: SPECTRUM COMPARISON (Eustress vs Distress)               */}
        {/* ---------------------------------------------------------------- */}
        <Node ref={spectrumNode} position={[0, 15]}>
          <Layout layout={true} direction="row" gap={20} alignItems="center" position={[0, -40]}>
            {/* Eustress Card */}
            <Rect
              ref={eustressCard}
              width={340}
              height={230}
              radius={18}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="#10B981"
              lineWidth={1.5}
              layout={true}
              direction="column"
              alignItems="center"
              justifyContent="center"
              gap={10}
              shadowColor="rgba(16, 185, 129, 0.25)"
              shadowBlur={24}
              scale={0.8}
              opacity={0}
            >
              <Txt
                text="EUSTRESS"
                fontFamily="Inter"
                fontWeight={800}
                fontSize={26}
                letterSpacing={0.5}
                fill="#10B981"
              />
              <Rect height={26} radius={999} fill="rgba(16, 185, 129, 0.2)" padding={[0, 14]}>
                <Txt text="ACUTE & ADAPTIVE" fontFamily="JetBrains Mono" fontSize={11} fill="#A7F3D0" />
              </Rect>
              <Txt
                text="Boosts alertness, memory & cellular growth."
                fontFamily="Inter"
                fontSize={13}
                fill="#94A3B8"
                textAlign="center"
                width={260}
              />
            </Rect>

            {/* VS Badge */}
            <Rect
              ref={vsBadge}
              size={[42, 42]}
              radius={999}
              fill="#181B28"
              stroke="#2E344A"
              lineWidth={1.5}
              layout={true}
              alignItems="center"
              justifyContent="center"
              scale={0}
            >
              <Txt text="VS" fontFamily="JetBrains Mono" fontWeight={700} fontSize={12} fill="#64748B" />
            </Rect>

            {/* Distress Card */}
            <Rect
              ref={distressCard}
              width={340}
              height={230}
              radius={18}
              fill="rgba(244, 63, 94, 0.06)"
              stroke="#F43F5E"
              lineWidth={1.5}
              layout={true}
              direction="column"
              alignItems="center"
              justifyContent="center"
              gap={10}
              shadowColor="rgba(244, 63, 94, 0.2)"
              shadowBlur={24}
              scale={0.8}
              opacity={0}
            >
              <Txt
                text="DISTRESS"
                fontFamily="Inter"
                fontWeight={800}
                fontSize={26}
                letterSpacing={0.5}
                fill="#F43F5E"
              />
              <Rect height={26} radius={999} fill="rgba(244, 63, 94, 0.2)" padding={[0, 14]}>
                <Txt text="CHRONIC & TOXIC" fontFamily="JetBrains Mono" fontSize={11} fill="#FECDD3" />
              </Rect>
              <Txt
                text="Unending load with zero physical recovery."
                fontFamily="Inter"
                fontSize={13}
                fill="#94A3B8"
                textAlign="center"
                width={260}
              />
            </Rect>
          </Layout>

          {/* Bottom Spectrum Gauge Bar */}
          <Node position={[0, 140]}>
            <Line
              ref={spectrumBar}
              points={[[-300, 0], [300, 0]]}
              stroke="#23273A"
              lineWidth={6}
              lineCap="round"
              end={0}
            />
            <Circle
              ref={spectrumPointer}
              size={18}
              fill="#10B981"
              shadowColor="rgba(16, 185, 129, 0.8)"
              shadowBlur={20}
              position={[-200, 0]}
              opacity={0}
            />
            <Txt
              text="PHYSIOLOGICAL STRESS SPECTRUM"
              fontFamily="JetBrains Mono"
              fontSize={11}
              letterSpacing={2}
              fill="#475569"
              position={[0, 26]}
            />
          </Node>
        </Node>

        {/* ---------------------------------------------------------------- */}
        {/* ACT 2 & 3: YERKES-DODSON INVERTED-U BELL CURVE                   */}
        {/* ---------------------------------------------------------------- */}
        <Node ref={curveNode} position={[0, 30]} opacity={0}>
          {/* Coordinate Axes */}
          <Line
            ref={axisX}
            points={[[-320, 150], [320, 150]]}
            stroke="#1F2436"
            lineWidth={1.5}
            lineCap="round"
          />
          <Line
            ref={axisY}
            points={[[-320, 150], [-320, -150]]}
            stroke="#1F2436"
            lineWidth={1.5}
            lineCap="round"
          />
          <Txt
            ref={axisLabelX}
            text="AROUSAL / STRESS INTENSITY →"
            fontFamily="JetBrains Mono"
            fontSize={10}
            letterSpacing={1.5}
            fill="#475569"
            position={[80, 175]}
          />
          <Txt
            ref={axisLabelY}
            text="PERFORMANCE ↑"
            fontFamily="JetBrains Mono"
            fontSize={10}
            letterSpacing={1.5}
            fill="#475569"
            position={[-260, -165]}
          />

          {/* Green Rising Curve (Eustress / Optimal Flow) */}
          <Line
            ref={curveLine}
            points={[
              [-300, 130],
              [-200, 60],
              [-100, -50],
              [0, -110],
            ]}
            stroke="#10B981"
            lineWidth={4}
            radius={30}
            lineCap="round"
            shadowColor="rgba(16, 185, 129, 0.45)"
            shadowBlur={24}
            end={0}
          />

          {/* Red Falling Curve (Distress / Overload) */}
          <Line
            ref={curveRedLine}
            points={[
              [0, -110],
              [100, -50],
              [200, 60],
              [300, 130],
            ]}
            stroke="#F43F5E"
            lineWidth={4}
            radius={30}
            lineCap="round"
            shadowColor="rgba(244, 63, 94, 0.45)"
            shadowBlur={24}
            end={0}
          />

          {/* Traveling Particle along Curve */}
          <Circle
            ref={curveParticle}
            size={16}
            fill="#10B981"
            shadowColor="rgba(16, 185, 129, 0.8)"
            shadowBlur={24}
            position={[-300, 130]}
            opacity={0}
          />
          <Circle
            ref={curveParticleRing}
            size={32}
            stroke="#10B981"
            lineWidth={1.5}
            position={[-300, 130]}
            opacity={0}
          />

          {/* Apex Peak Marker Indicator */}
          <Node ref={peakMarker} position={[0, -110]} opacity={0}>
            <Line
              points={[[0, 0], [0, 260]]}
              stroke="#2E344A"
              lineWidth={1}
              lineDash={[6, 6]}
            />
            <Rect
              position={[0, -42]}
              height={32}
              radius={999}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#10B981"
              lineWidth={1.5}
              padding={[0, 16]}
              layout={true}
              alignItems="center"
            >
              <Txt
                text="PEAK ADAPTATION // OPTIMAL FLOW"
                fontFamily="JetBrains Mono"
                fontSize={11}
                letterSpacing={1.5}
                fill="#34D399"
              />
            </Rect>
          </Node>

          {/* Live Telemetry Display */}
          <Layout
            position={[-170, -70]}
            layout={true}
            direction="column"
            alignItems="start"
            gap={4}
          >
            <Txt
              ref={focusSubTxt}
              text="COGNITIVE SHARPNESS"
              fontFamily="JetBrains Mono"
              fontSize={11}
              letterSpacing={1.5}
              fill="#64748B"
            />
            <Txt
              ref={focusMetricTxt}
              text={() =>
                isCortisolMode()
                  ? `${cortisolSignal().toFixed(1)}x HIGH`
                  : `${focusSignal().toFixed(0)}%`
              }
              fontFamily="Inter"
              fontWeight={800}
              fontSize={54}
              letterSpacing={-1.5}
              fill="#10B981"
              shadowColor="rgba(16, 185, 129, 0.35)"
              shadowBlur={20}
            />
          </Layout>

          {/* Floating Neuro Badges */}
          <Layout position={[170, -70]} layout={true} direction="column" gap={10} alignItems="end">
            <Rect
              ref={neuroBadgeA}
              height={30}
              radius={8}
              fill="rgba(6, 182, 212, 0.15)"
              stroke="#06B6D4"
              lineWidth={1.5}
              padding={[0, 14]}
              layout={true}
              alignItems="center"
              scale={0}
            >
              <Txt text="+ DOPAMINE SURGE" fontFamily="JetBrains Mono" fontSize={11} fill="#67E8F9" />
            </Rect>
            <Rect
              ref={neuroBadgeB}
              height={30}
              radius={8}
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10B981"
              lineWidth={1.5}
              padding={[0, 14]}
              layout={true}
              alignItems="center"
              scale={0}
            >
              <Txt text="+ NEURAL PLASTICITY" fontFamily="JetBrains Mono" fontSize={11} fill="#6EE7B7" />
            </Rect>
          </Layout>
        </Node>

        {/* ---------------------------------------------------------------- */}
        {/* ACT 4: ADAPTATION FORMULA (Stress + Recovery = Growth)          */}
        {/* ---------------------------------------------------------------- */}
        <Node ref={formulaNode} position={[0, 20]} opacity={0}>
          <Layout layout={true} direction="row" gap={16} alignItems="center" position={[0, -50]}>
            {/* Box 1: Stress */}
            <Rect
              ref={formulaCardA}
              width={200}
              height={140}
              radius={18}
              fill="rgba(245, 158, 11, 0.1)"
              stroke="#F59E0B"
              lineWidth={1.5}
              layout={true}
              direction="column"
              alignItems="center"
              justifyContent="center"
              gap={8}
              shadowColor="rgba(245, 158, 11, 0.25)"
              shadowBlur={20}
              scale={0.8}
            >
              <Txt text="STRESS" fontFamily="Inter" fontWeight={800} fontSize={22} fill="#F59E0B" />
              <Txt text="Acute Stimulus" fontFamily="JetBrains Mono" fontSize={11} fill="#94A3B8" />
            </Rect>

            <Txt ref={formulaPlus} text="+" fontFamily="Inter" fontWeight={700} fontSize={32} fill="#64748B" scale={0} />

            {/* Box 2: Recovery */}
            <Rect
              ref={formulaCardB}
              width={200}
              height={140}
              radius={18}
              fill="rgba(6, 182, 212, 0.1)"
              stroke="#06B6D4"
              lineWidth={1.5}
              layout={true}
              direction="column"
              alignItems="center"
              justifyContent="center"
              gap={8}
              shadowColor="rgba(6, 182, 212, 0.25)"
              shadowBlur={20}
              scale={0.8}
            >
              <Txt text="RECOVERY" fontFamily="Inter" fontWeight={800} fontSize={22} fill="#06B6D4" />
              <Txt text="Sleep & Rest" fontFamily="JetBrains Mono" fontSize={11} fill="#94A3B8" />
            </Rect>

            <Txt ref={formulaEqual} text="=" fontFamily="Inter" fontWeight={700} fontSize={32} fill="#64748B" scale={0} />

            {/* Box 3: Adaptation */}
            <Rect
              ref={formulaCardC}
              width={220}
              height={140}
              radius={18}
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10B981"
              lineWidth={2}
              layout={true}
              direction="column"
              alignItems="center"
              justifyContent="center"
              gap={8}
              shadowColor="rgba(16, 185, 129, 0.35)"
              shadowBlur={24}
              scale={0.8}
            >
              <Txt text="GROWTH" fontFamily="Inter" fontWeight={800} fontSize={24} fill="#10B981" />
              <Txt text="Supercompensation" fontFamily="JetBrains Mono" fontSize={11} fill="#6EE7B7" />
            </Rect>
          </Layout>

          {/* Subtitle description */}
          <Txt
            ref={formulaSubtext}
            text="THE PRINCIPLE OF SYSTEMIC ADAPTATION"
            fontFamily="JetBrains Mono"
            fontSize={12}
            letterSpacing={2}
            fill="#818CF8"
            position={[0, 60]}
            opacity={0}
          />

          {/* Sine Wave Equilibrium Line */}
          <Line
            ref={sineWaveLine}
            position={[0, 130]}
            points={[
              [-300, 0],
              [-200, -20],
              [-100, 20],
              [0, -20],
              [100, 20],
              [200, -20],
              [300, 0],
            ]}
            stroke="#818CF8"
            lineWidth={3.5}
            radius={28}
            lineCap="round"
            shadowColor="rgba(129, 140, 248, 0.4)"
            shadowBlur={20}
            end={0}
          />
        </Node>
      </Rect>

      {/* ================================================================== */}
      {/* TIER 3: BOTTOM KINETIC CAPTION ANCHOR (Y = 440, 820 x 96)          */}
      {/* ================================================================== */}
      <Rect
        ref={captionCard}
        position={[0, 440]}
        width={820}
        height={96}
        radius={20}
        fill="rgba(16, 18, 27, 0.9)"
        stroke="#23273A"
        lineWidth={1.5}
        shadowColor="rgba(0, 0, 0, 0.5)"
        shadowBlur={26}
        layout={true}
        direction="column"
        alignItems="center"
        justifyContent="center"
        padding={[10, 24]}
        opacity={0}
      >
        <Txt
          ref={captionLine1}
          text="Not all stress is toxic."
          fontFamily="Inter"
          fontWeight={700}
          fontSize={27}
          letterSpacing={-0.6}
          fill="#F8FAFC"
        />
        <Txt
          ref={captionLine2}
          text=""
          fontFamily="Inter"
          fontWeight={600}
          fontSize={22}
          letterSpacing={-0.3}
          fill="#94A3B8"
        />
      </Rect>
    </>
  );

  // ===========================================================================
  // 4. CHOREOGRAPHY & PHYSICS (TEMPORALLY LOCKED TO 5 VOICE CUES)
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // CUE 0 (0.05s -> 2.225s | duration: 2.175s)
  // Script: "Not all stress is toxic."
  // ---------------------------------------------------------------------------
  // Frame 0: Instant Hook Entrance
  yield* all(
    gridRef().opacity(1, 1.2, easeInOutCubic),
    topPill().scale(1, 0.5, easeOutBack),
    topPill().opacity(1, 0.4, easeOutExpo),
    titleText().y(0, 0.65, easeOutExpo),
    titleText().opacity(1, 0.4, easeOutExpo),
    heroCard().scale(1, 0.7, easeOutBack),
    heroCard().opacity(1, 0.4, easeOutExpo),
    captionCard().opacity(1, 0.4, easeOutExpo),
  );

  // Split cards spring in
  yield* all(
    eustressCard().scale(1, 0.6, easeOutBack),
    eustressCard().opacity(1, 0.4, easeOutExpo),
    distressCard().scale(1, 0.6, easeOutBack),
    distressCard().opacity(1, 0.4, easeOutExpo),
    vsBadge().scale(1, 0.5, easeOutBack),
    spectrumBar().end(1, 0.8, easeOutExpo),
    spectrumPointer().opacity(1, 0.4, easeOutExpo),
    captionLine1().text("Not all stress is toxic.", 0.2),
  );

  // Settle remainder of Cue 0
  yield* waitFor(0.5);

  // ---------------------------------------------------------------------------
  // CUE 1 (2.225s -> 10.275s | duration: 8.050s)
  // Script: "Short bursts of acute stress, called eustress, flood your brain with
  //          dopamine and focus, pushing you into peak performance."
  // ---------------------------------------------------------------------------
  // Phase 1A: Morph from Spectrum into Yerkes-Dodson Curve (0.8s)
  yield* all(
    spectrumNode().opacity(0, 0.4, easeInOutCubic),
    spectrumNode().scale(0.9, 0.4, easeInOutCubic),
    curveNode().opacity(1, 0.5, easeOutExpo),
    stageHeaderTxt().text("YERKES-DODSON PERFORMANCE CURVE", 0.3),
    captionLine1().text("Short bursts of acute stress:", 0.3),
    captionLine1().fill("#38BDF8", 0.3),
    captionLine2().text("EUSTRESS triggers cognitive sharpness", 0.3),
    captionLine2().fill("#10B981", 0.3),
  );

  // Phase 1B: Draw Rising Eustress Curve & Glide Particle to Peak (2.5s)
  yield* all(
    curveParticle().opacity(1, 0.3, easeOutExpo),
    curveParticleRing().opacity(0.8, 0.3, easeOutExpo),
    curveLine().end(1, 2.4, easeInOutCubic),
    curveParticle().position([0, -110], 2.4, easeInOutCubic),
    curveParticleRing().position([0, -110], 2.4, easeInOutCubic),
    focusSignal(94, 2.5, easeInOutExpo),
  );

  // Phase 1C: Neuro Badges Pop + Caption updates to dopamine surge (1.8s)
  yield* all(
    captionLine1().text("Floods your brain with dopamine & focus,", 0.3),
    captionLine1().fill("#F8FAFC", 0.3),
    captionLine2().text("activating heightened neural plasticity.", 0.3),
    captionLine2().fill("#67E8F9", 0.3),
    neuroBadgeA().scale(1, 0.5, easeOutBack),
    neuroBadgeB().scale(1, 0.5, easeOutBack),
  );

  // Phase 1D: Reach Apex Peak Performance (2.0s)
  yield* all(
    peakMarker().opacity(1, 0.6, easeOutExpo),
    curveParticleRing().scale(1.8, 0.8, easeOutExpo),
    captionLine1().text("Pushing you straight into", 0.3),
    captionLine1().fill("#94A3B8", 0.3),
    captionLine2().text("PEAK ADAPTATION & PERFORMANCE.", 0.3),
    captionLine2().fill("#10B981", 0.3),
  );

  // Hold remainder of Cue 1
  yield* waitFor(0.7);

  // ---------------------------------------------------------------------------
  // CUE 2 (10.275s -> 17.300s | duration: 7.025s)
  // Script: "The danger is chronic distress: non-stop pressure with zero recovery
  //          that spikes cortisol and causes burnout."
  // ---------------------------------------------------------------------------
  // Phase 2A: Warning Alert & Falling Red Curve (2.2s)
  yield* all(
    // Warning state shifts
    heroCard().stroke("#F43F5E", 0.8, easeInOutCubic),
    heroCard().shadowColor("rgba(244, 63, 94, 0.4)", 0.8, easeInOutCubic),
    statusPulseDot().fill("#F43F5E", 0.4),
    statusPulseDot().shadowColor("rgba(244, 63, 94, 0.8)", 0.4),
    stageHeaderTxt().text("WARNING // CHRONIC DISTRESS", 0.4),
    stageHeaderTxt().fill("#F43F5E", 0.4),

    // Draw the downward red curve into exhaustion
    curveRedLine().end(1, 2.2, easeInOutCubic),
    curveParticle().position([300, 130], 2.2, easeInOutCubic),
    curveParticleRing().position([300, 130], 2.2, easeInOutCubic),
    curveParticle().fill("#F43F5E", 0.5),
    curveParticleRing().stroke("#F43F5E", 0.5),

    // Caption transition
    captionLine1().text("The danger is CHRONIC DISTRESS:", 0.3),
    captionLine1().fill("#F43F5E", 0.3),
    captionLine2().text("non-stop pressure with zero physical recovery.", 0.3),
    captionLine2().fill("#FECDD3", 0.3),
  );

  // Phase 2B: Metric transforms to Cortisol Spike & Burnout (2.8s)
  yield* all(
    focusSubTxt().text("SYSTEMIC CORTISOL", 0.3),
    focusSubTxt().fill("#F43F5E", 0.3),
    focusMetricTxt().fill("#F43F5E", 0.3),
    isCortisolMode(true, 0),
    cortisolSignal(8.4, 2.4, easeInOutExpo),
    neuroBadgeA().stroke("#F43F5E", 0.4),
    neuroBadgeA().fill("rgba(244, 63, 94, 0.15)", 0.4),
    neuroBadgeB().stroke("#F43F5E", 0.4),
    neuroBadgeB().fill("rgba(244, 63, 94, 0.15)", 0.4),
    captionLine1().text("Spikes toxic cortisol levels,", 0.3),
    captionLine1().fill("#F8FAFC", 0.3),
    captionLine2().text("leading directly to systemic BURNOUT.", 0.3),
    captionLine2().fill("#F43F5E", 0.3),
  );

  // Hold remainder of Cue 2
  yield* waitFor(1.2);

  // ---------------------------------------------------------------------------
  // CUE 3 (17.300s -> 19.200s | duration: 1.900s)
  // Script: "Stress isn't your enemy."
  // ---------------------------------------------------------------------------
  yield* all(
    // Dissolve the crisis curve
    curveNode().opacity(0, 0.4, easeInOutCubic),
    curveNode().scale(0.85, 0.4, easeInOutCubic),

    // Restore hero card to elegant indigo
    heroCard().stroke("#23273A", 0.6, easeInOutCubic),
    heroCard().shadowColor("rgba(0, 0, 0, 0.5)", 0.6, easeInOutCubic),
    statusPulseDot().fill("#818CF8", 0.4),
    statusPulseDot().shadowColor("rgba(129, 140, 248, 0.6)", 0.4),
    stageHeaderTxt().text("THE BIOLOGICAL EQUILIBRIUM", 0.4),
    stageHeaderTxt().fill("#94A3B8", 0.4),

    // Reveal formula node
    formulaNode().opacity(1, 0.5, easeOutExpo),
    formulaNode().scale(1, 0.5, easeOutBack),

    // Caption
    captionLine1().text("Stress is NOT your enemy.", 0.3),
    captionLine1().fill("#F8FAFC", 0.3),
    captionLine2().text("It is the fundamental catalyst for adaptation.", 0.3),
    captionLine2().fill("#94A3B8", 0.3),
  );

  // ---------------------------------------------------------------------------
  // CUE 4 (19.200s -> 21.262s | duration: 2.062s)
  // Script: "Unrecovered stress is."
  // ---------------------------------------------------------------------------
  // Snap in the 3-part growth formula
  yield* sequence(
    0.08,
    formulaCardA().scale(1, 0.4, easeOutBack),
    formulaPlus().scale(1, 0.4, easeOutBack),
    formulaCardB().scale(1, 0.4, easeOutBack),
    formulaEqual().scale(1, 0.4, easeOutBack),
    formulaCardC().scale(1, 0.5, easeOutBack),
  );

  yield* all(
    formulaSubtext().opacity(1, 0.5, easeOutExpo),
    sineWaveLine().end(1, 1.2, easeInOutCubic),
    captionLine1().text("UNRECOVERED stress is.", 0.3),
    captionLine1().fill("#818CF8", 0.3),
    captionLine2().text("STRESS + RECOVERY = EXPONENTIAL GROWTH.", 0.3),
    captionLine2().fill("#10B981", 0.3),
  );

  // Final resolution hold
  yield* waitFor(0.8);
});
