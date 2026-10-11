# Motion Canvas API & Cheatsheet (TypeScript)

This reference documents the exact TypeScript syntax, reactive mechanics, and lifecycle rules for `@motion-canvas/core` and `@motion-canvas/2d`.

---

## 1. Scene Generator Lifecycle

Every scene must be exported as a generator using `makeScene2D`:

```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {waitFor} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  // 1. Instantiation Phase: Build nodes & add to view
  // 2. Choreography Phase: yield* tweens
  // 3. Retention Pause: yield* waitFor(1.0);
});
```

---

## 2. Signals & Reactivity

Signals are the reactive bedrock of Motion Canvas.

### Declaring & Accessing Signals
```typescript
import {createSignal} from '@motion-canvas/core';

const progress = createSignal(0);

// Reading the signal:
const current = progress(); // Call as function!

// Animating the signal:
yield* progress(1, 1.2, easeInOutCubic);
```

### Dynamic Text Interpolation
Pass an arrow function to reactive properties:
```typescript
<Txt text={() => `Latency: ${progress().toFixed(2)} ms`} />
```

---

## 3. Component References

Use `createRef` for single elements and `createRefArray` for collections.

```typescript
import {createRef, createRefArray} from '@motion-canvas/core';
import {Rect, Txt} from '@motion-canvas/2d';

// Single reference:
const boxRef = createRef<Rect>();
view.add(<Rect ref={boxRef} size={200} fill="#6366F1" />);

// Animate property:
yield* boxRef().scale(1.2, 0.6, easeOutBack);

// Array of references:
const items = createRefArray<Txt>();
view.add(
  <>
    <Txt ref={items} text="Node 1" />
    <Txt ref={items} text="Node 2" />
    <Txt ref={items} text="Node 3" />
  </>
);

// Access items: items[0]().opacity(...)
```

---

## 4. Animation Combinators

Control execution flow using core combinators:

| Combinator | Behavior | Syntax Example |
| :--- | :--- | :--- |
| `all(...)` | Runs all animations concurrently. Completes when the longest finishes. | `yield* all(node.opacity(1, 0.5), node.y(0, 0.8));` |
| `sequence(stagger, ...)` | Runs animations concurrently with an offset delay between each start. | `yield* sequence(0.08, ...nodes.map(n => n.scale(1, 0.5)));` |
| `chain(...)` | Runs animations strictly sequentially one after another. | `yield* chain(step1(), step2(), step3());` |
| `delay(seconds, tween)` | Delays a specific tween within an `all()` block. | `yield* all(nodeA.x(100, 1), delay(0.3, nodeB.x(100, 1)));` |
| `waitFor(seconds)` | Freezes timeline execution for reading comprehension. | `yield* waitFor(1.5);` |

---

## 5. Easing Profiles

Motion must reflect real physical mass, tension, and friction.

```typescript
import {
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutExpo,
  easeInOutExpo,
  easeOutBack,
  easeInOutBack,
} from '@motion-canvas/core';
```

- **`easeOutExpo`**: Snappy, modern UI arrival. Swift initial velocity, smooth exponential glide into place.
- **`easeOutBack`**: Organic entrance with slight physical overshoot. Use on cards, badges, and icons.
- **`easeInOutCubic`**: Balanced S-curve for continuous value transitions, camera pans, and vector trajectories.
- **`easeInOutExpo`**: Dramatic, cinematic acceleration and deceleration.

---

## 6. Layout Mode vs Absolute Positioning

### Layout Mode (Flexbox)
When `layout={true}` is set, children are organized by Flexbox rules:
```typescript
<Layout
  layout={true}
  direction="row"        // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  gap={24}               // Gap between children in px
  alignItems="center"    // 'center' | 'start' | 'end' | 'stretch' | 'baseline' (NEVER use 'flex-start')
  justifyContent="space-between" // 'center' | 'start' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  padding={32}
>
  <Rect size={[200, 80]} radius={12} fill="#1E2433" />
  <Rect size={[200, 80]} radius={12} fill="#1E2433" />
</Layout>
```

### Absolute Mode (Canvas Center Coordinates)
When `layout={false}` (default for raw nodes), positions are offset from parent center:
- `position={[x, y]}`
- `[0, 0]` is canvas center.
- `[-960, -540]` is top-left corner.
- `[960, 540]` is bottom-right corner.

---

## 7. Common Agent Pitfalls & Fixes

### ❌ Error 1: Using `await` instead of `yield*`
- **Broken**: `await node().opacity(1, 0.5);`
- **Correct**: `yield* node().opacity(1, 0.5);`

### ❌ Error 2: Forgetting the ref call parenthesis
- **Broken**: `node.opacity(1, 0.5);`
- **Correct**: `node().opacity(1, 0.5);` (`node` is a ref container, `node()` unpacks the element).

### ❌ Error 3: Direct assignment instead of tweening
- **Broken**: `node().opacity = 1;`
- **Correct (Instant)**: `node().opacity(1);`
- **Correct (Tweened)**: `yield* node().opacity(1, 0.6, easeOutExpo);`

### ❌ Error 4: Unformatted raw floating point numbers
- **Broken**: `<Txt text={() => `${signal()}%`} />` (displays `45.89128491823%`)
- **Correct**: `<Txt text={() => `${signal().toFixed(1)}%`} />` (displays `45.9%`)

### ❌ Error 5: Using `flex-start` or `flex-end` in Layout
- **Broken**: `alignItems="flex-start"` or `justifyContent="flex-end"`
- **Correct**: `alignItems="start"` and `justifyContent="end"` (Motion Canvas uses simplified `'start' | 'end' | 'center' | 'stretch' | 'baseline'`).

### ❌ Error 6: Guessing audio sync timings without generating voice cues
- **Broken**: Hardcoding arbitrary durations (`yield* waitFor(10)`) without checking actual audio speech length.
- **Correct**: Run `python3 scripts/generate_voice.py`, inspect `src/voice_cues.json`, and lock scene durations directly to cue timestamps.

---

## 8. Project Audio Binding & Voiceover

Motion Canvas natively synchronizes animation generators with external audio tracks.

### Binding Audio in `src/project.ts`
```typescript
import {makeProject} from '@motion-canvas/core';
import audio from './audio.mp3';
import scene from './scenes/showcase?scene';

export default makeProject({
  scenes: [scene],
  audio, // Binds waveform, enables editor scrub sync & export audio muxing
});
```

### Cue-Locked Synchronous Tweens
```typescript
import {makeScene2D} from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core';
import cues from '../voice_cues.json';

export default makeScene2D(function* (view) {
  // Cue 0: "Autonomous Consensus Engine" [0.05s - 2.80s]
  yield* all(
    title().y(0, cues.cues[0].duration, easeOutExpo),
    title().opacity(1, 0.4),
  );

  // Cue 1: "State finality achieved in 14ms" [2.85s - 5.10s]
  yield* all(
    metricSignal(14, cues.cues[1].duration, easeInOutCubic),
  );
});
```

