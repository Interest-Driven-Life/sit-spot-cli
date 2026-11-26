// The scenes, one per Sit Spot practice: the character acts out the mindful nature
// and sensory grounding breaks in terminal pixel art using Sit Spot Club brand tokens
// (Forest Green, Warm Gold, Slate, and Off-White). Pure functions: a frame is a
// function of the break, time t in ms, width, and whether the terminal has colour.

import type { SceneId } from '../types'
import {
  ARM,
  BODY,
  DEEP,
  EYE,
  eyesFront,
  figure,
  FOREST_GREEN,
  GLINT,
  LIGHT,
  OFF_WHITE,
  seated,
  SHADE,
  sittingCalm,
  sittingGround,
  SLATE,
  standing,
  WARM_GOLD,
} from './figure'
import type { Body, Look } from './figure'
import {
  blend,
  block,
  canvas,
  clamp01,
  DEFAULT,
  dot,
  ease,
  keyed,
  lerp,
  line,
  mix,
  PH,
  rect,
  ROWS,
  text,
  toFrame,
} from './pixels'
import type { Canvas, Frame, P } from './pixels'

export type { SceneId, Frame }
export { BODY, DEFAULT, ROWS }

export const SCENE_IDS: readonly SceneId[] = [
  'eyes',
  'sound',
  'wood',
  'breathe',
  'outside',
  'weather',
]

/** Whether this version draws `id`: a break stored by an older one may name a scene since dropped. */
export function hasScene(id: unknown): id is SceneId {
  return typeof id === 'string' && (SCENE_IDS as readonly string[]).includes(id)
}

/** Narrower than this (the viewport's columns), the scene is left out. */
export const MIN_COLUMNS = 54
/** Columns kept clear at the right edge of the viewport. */
export const EDGE = 4
/** A scene never stretches wider than this; past it, it is only more floor. */
export const MAX_WIDTH = 96

export const EYES_MS = 20_000
export const SOUND_MS = 15_000
export const WOOD_MS = 15_000
export const WAVE_MS = 4000
export const BREATHE_ROUNDS = 3
export const OUTSIDE_MS = 60_000
export const WEATHER_MS = 20_000

// Sit Spot brand palette mappings
export const FOREST = FOREST_GREEN
export const GOLD = WARM_GOLD
export const SLATE_COLOR = SLATE
export const OFF_WHITE_COLOR = OFF_WHITE

export const PROP = SLATE_COLOR
export const CHAIR = mix(SLATE_COLOR, 0x000000, 0.25)
export const WATER = 0x5ab0f0
export const FLOOR = SLATE_COLOR
export const PEBBLE = mix(SLATE_COLOR, GOLD, 0.2)
export const GOOD = FOREST
export const TRUNK = 0x8a6a4f
export const SCREEN = 0x34506e
export const AIR = mix(WATER, OFF_WHITE_COLOR, 0.5)
export const DIM = mix(SLATE_COLOR, 0xffffff, 0.35)
export const TEXT = DEFAULT

/** Colours the plain (NO_COLOR) frame leaves unlit, so the eyes stay holes in the face. */
const HOLES: ReadonlySet<number> = new Set([EYE, GLINT])

/**
 * How wide a scene is drawn in `columns` free cells, or null when that is too
 * narrow (under MIN_COLUMNS less EDGE).
 */
export function sceneWidth(columns: number | undefined): number | null {
  if (columns === undefined || !Number.isFinite(columns) || columns < MIN_COLUMNS - EDGE) return null
  return Math.min(MAX_WIDTH, Math.floor(columns))
}

// --- the words beside the art ---------------------------------------------

const wordsAt = (c: Canvas) => Math.min(32, c.W - 20)
const MAIN = 3, SUB = 4, BAR = 6
const BAR_LEN = 16

function say(c: Canvas, row: number, s: string, fg = TEXT) {
  text(c, wordsAt(c), row, s, fg)
}

/** A progress bar of `k` (0..1) under the words. */
function bar(c: Canvas, k: number) {
  const x = wordsAt(c)
  const done = Math.round(clamp01(k) * BAR_LEN)
  for (let i = 0; i < BAR_LEN; i++) {
    c.glyphs.push(i < done ? { x: x + i, row: BAR, ch: '━', fg: GOLD } : { x: x + i, row: BAR, ch: '━', fg: FLOOR, plain: '─' })
  }
}

// --- props & nature -------------------------------------------------------

const GROUND = PH - 1

function floor(c: Canvas) {
  rect(c, 0, GROUND, c.W, 1, FLOOR)
}

function tree(c: Canvas, x: number, y: number) {
  dot(c, x, y, FOREST)
  rect(c, x - 1, y + 1, 3, 1, FOREST)
  rect(c, x - 1, y + 2, 3, 1, mix(FOREST, 0x000000, 0.2))
  rect(c, x - 2, y + 3, 5, 1, FOREST)
  dot(c, x, y + 4, TRUNK)
}

function chair(c: Canvas, x: number, top = 6) {
  line(c, [x - 3, top], [x - 3, GROUND - 1], CHAIR, 2)
  rect(c, x - 3, 13, 7, 1, CHAIR)
  line(c, [x + 3, 13], [x + 3, GROUND - 1], CHAIR, 1)
}

function desk(c: Canvas, x: number, top = 11, woodSurface = false) {
  rect(c, x, top, 9, 1, woodSurface ? GOLD : PROP)
  line(c, [x + 7, top + 1], [x + 7, GROUND - 1], woodSurface ? TRUNK : PROP, 1)
}

// --- 1. Eye rest (20-20-20) ------------------------------------------------

export function eyesLeft(t: number): number {
  return Math.max(0, Math.ceil((EYES_MS - t) / 1000))
}

function eyes(c: Canvas, t: number) {
  const left = eyesLeft(t)
  const done = left === 0
  // Close-up of figure gazing past window at a distant tree and clouds
  rect(c, 1, 17, 18, 3, SHADE)
  rect(c, 8, 15, 4, 2, BODY)
  block(c, 2, 2, 16, 13, BODY)
  const blink = !done && t % 4000 > 3820
  if (done) {
    for (const ex of [6, 12]) {
      dot(c, ex - 1, 8, EYE)
      dot(c, ex, 7, EYE)
      dot(c, ex + 1, 8, EYE)
    }
  } else {
    const look = Math.round(1 + 0.6 * Math.sin(t / 900))
    eyesFront(c, [5, 6], [11, 6], 4, look, blink)
  }

  // Far landscape: sky, clouds, horizon and evergreen tree
  const far = 25
  rect(c, 20, 14, 9, 1, mix(FLOOR, 0x000000, 0.1))
  line(c, [21, 14], [24, 12], mix(FOREST, 0x000000, 0.45))
  line(c, [24, 12], [28, 14], mix(FOREST, 0x000000, 0.45))
  tree(c, far, 8)

  // Floating cloud in warm off-white
  const cloudX = 21 + Math.floor((t / 1200) % 8)
  rect(c, cloudX, 3, 4, 1, OFF_WHITE_COLOR)
  rect(c, cloudX + 1, 2, 2, 1, OFF_WHITE_COLOR)

  if (!done) {
    const step = Math.floor(t / 160)
    for (let i = 0; i < 6; i++) if ((i + step) % 3 === 0) dot(c, 19 + i * 0.8, 8 + i * 0.35, GOLD)
    say(c, MAIN, `${left}s`)
    say(c, SUB, 'sky & tree', DIM)
  } else {
    say(c, MAIN, 'done!', GOLD)
  }
  bar(c, Math.min(t, EYES_MS) / EYES_MS)
}

// --- 2. Sensory gating (15s furthest sound) --------------------------------

export function soundLeft(t: number): number {
  return Math.max(0, Math.ceil((SOUND_MS - t) / 1000))
}

function sound(c: Canvas, t: number) {
  floor(c)
  const cx = 9
  chair(c, cx)
  const pose = sittingCalm(cx)
  // Gentle breathing subtle movement in torso
  const breath = 0.4 * Math.sin(t / 1200)
  pose.neck = [pose.neck[0], pose.neck[1] + breath]
  pose.head = [pose.head[0], pose.head[1] + breath]

  figure(c, pose, { blink: true }) // Eyes closed in quiet listening

  const left = soundLeft(t)
  const done = left === 0

  // Sound rings radiating from the right edge toward the ears
  const phase = (t / 1000) % 2
  for (let r = 0; r < 3; r++) {
    const dist = (phase + r * 0.7) % 2.5
    const rx = Math.round(25 - dist * 4)
    if (rx > 15 && rx < c.W) {
      dot(c, rx, 4, mix(GOLD, OFF_WHITE_COLOR, 0.5))
      dot(c, rx + 1, 5, mix(GOLD, OFF_WHITE_COLOR, 0.3))
      dot(c, rx + 1, 6, mix(GOLD, OFF_WHITE_COLOR, 0.3))
      dot(c, rx, 7, mix(GOLD, OFF_WHITE_COLOR, 0.5))
    }
  }

  if (!done) {
    say(c, MAIN, `${left}s`)
    say(c, SUB, 'furthest sound', DIM)
  } else {
    say(c, MAIN, 'done!', GOLD)
  }
  bar(c, Math.min(t, SOUND_MS) / SOUND_MS)
}

// --- 3. Touching wood (Somatic desk grounding) ------------------------------

export function woodLeft(t: number): number {
  return Math.max(0, Math.ceil((WOOD_MS - t) / 1000))
}

function wood(c: Canvas, t: number) {
  floor(c)
  const cx = 8
  chair(c, cx)
  desk(c, cx + 8, 11, true)

  // Real wood grain on desk
  rect(c, cx + 8, 11, 10, 2, GOLD)
  line(c, [cx + 9, 11], [cx + 17, 11], TRUNK, 1)
  dot(c, cx + 12, 12, mix(TRUNK, 0x000000, 0.3))

  const pose = sittingGround(cx)
  const pulse = Math.sin(t / 600)
  // Subtle contact pulse on wood under palms
  rect(c, cx + 14, 10, 3, 1, pulse > 0 ? mix(GOLD, OFF_WHITE_COLOR, 0.4) : GOLD)

  figure(c, pose, { blink: t % 4000 > 3800 })

  const left = woodLeft(t)
  const done = left === 0

  if (!done) {
    say(c, MAIN, `${left}s`)
    say(c, SUB, 'touching wood', DIM)
  } else {
    say(c, MAIN, 'grounded!', GOLD)
  }
  bar(c, Math.min(t, WOOD_MS) / WOOD_MS)
}

// --- 4. Ocean wave breath (4s in, 4s hold, 4s out) -------------------------

const WAVE_STEPS = ['inhale wave', 'hold crest', 'exhale wave'] as const

function breathe(c: Canvas, t: number) {
  floor(c)
  const side = Math.floor(t / WAVE_MS)
  const round = Math.floor(side / 3)
  const s = side % 3
  const at = t % WAVE_MS
  const done = round >= BREATHE_ROUNDS
  const k = at / WAVE_MS

  // Lungs and calm sitting figure
  const cx = 8
  chair(c, cx)
  const pose = sittingCalm(cx)
  const swell = s === 0 ? ease(k) : s === 1 ? 1 : 1 - ease(k)
  pose.head = [pose.head[0], pose.head[1] - swell * 0.8]
  pose.neck = [pose.neck[0], pose.neck[1] - swell * 0.8]

  figure(c, pose, { blink: true })

  // Ocean wave rolling in and out on the right
  const waveBaseX = 22
  const waveHeight = Math.round(lerp(2, 6, swell))
  const waveOffset = Math.sin(t / 800)

  // Undulating water surface and foam crest
  for (let wx = 0; wx < 8; wx++) {
    const wy = 15 - Math.round(Math.sin((wx + t / 400) * 0.8) * (waveHeight * 0.5))
    dot(c, waveBaseX + wx, wy, WATER)
    if (wy > 10) rect(c, waveBaseX + wx, wy + 1, 1, GROUND - wy, mix(WATER, SLATE_COLOR, 0.3))
    if (s === 1 || swell > 0.8) dot(c, waveBaseX + wx, wy - 1, OFF_WHITE_COLOR) // Foam crest
  }

  if (done) {
    say(c, MAIN, 'done!', GOLD)
    bar(c, 1)
    return
  }

  const secs = 4 - Math.floor(at / 1000)
  say(c, MAIN, `${WAVE_STEPS[s]} ${secs}`)
  say(c, SUB, `round ${round + 1}/${BREATHE_ROUNDS}`, DIM)
  bar(c, (side + k) / (BREATHE_ROUNDS * 3))
}

// --- 5. Step outside (60-second micro-pause) -------------------------------

export function outsideLeft(t: number): number {
  return Math.max(0, Math.ceil((OUTSIDE_MS - t) / 1000))
}

function outside(c: Canvas, t: number) {
  floor(c)
  // Porch doorway frame and wooden planks
  line(c, [6, 2], [6, GROUND], SLATE_COLOR, 2)
  rect(c, 0, GROUND, 15, 1, GOLD) // Wood deck
  line(c, [6, 2], [16, 2], SLATE_COLOR, 1) // Lintel

  // Outdoors on right: pine tree, fresh sky, light breeze
  tree(c, 24, 7)
  const breeze = (t / 300) % 8
  dot(c, 18 + breeze, 6, OFF_WHITE_COLOR)
  dot(c, 21 + breeze, 10, mix(FOREST, GOLD, 0.3))

  const x = 11
  const pose = standing(x)
  // Looking out peacefully
  pose.head = [pose.head[0] + 0.5, pose.head[1] - 0.2]
  figure(c, pose, { blink: t % 4200 > 4000 })

  const left = outsideLeft(t)
  const done = left === 0

  if (!done) {
    say(c, MAIN, `${left}s`)
    say(c, SUB, 'step outside', DIM)
  } else {
    say(c, MAIN, 'done!', GOLD)
  }
  bar(c, Math.min(t, OUTSIDE_MS) / OUTSIDE_MS)
}

// --- 6. Weather / light check (Observe daylight & wind) --------------------

export function weatherLeft(t: number): number {
  return Math.max(0, Math.ceil((WEATHER_MS - t) / 1000))
}

function weather(c: Canvas, t: number) {
  floor(c)
  const cx = 9
  const pose = standing(cx)
  // Peaceful upward head tilt observing sky
  pose.head = [pose.head[0] + 0.5, pose.head[1] - 0.5]
  figure(c, pose, { blink: t % 3800 > 3600 })

  // Warm golden sun and daylight beams
  const sunX = 24, sunY = 3
  rect(c, sunX, sunY, 3, 2, GOLD)
  dot(c, sunX - 1, sunY, mix(GOLD, OFF_WHITE_COLOR, 0.4))
  dot(c, sunX + 3, sunY + 1, mix(GOLD, OFF_WHITE_COLOR, 0.4))
  dot(c, sunX + 1, sunY - 1, mix(GOLD, OFF_WHITE_COLOR, 0.4))

  // Swaying branch in wind
  const sway = Math.sin(t / 700) * 1.5
  line(c, [20, 11], [25 + sway, 10], TRUNK, 1)
  dot(c, 24 + sway, 9, FOREST)
  dot(c, 26 + sway, 10, FOREST)
  dot(c, 25 + sway, 11, mix(FOREST, GOLD, 0.2))

  const left = weatherLeft(t)
  const done = left === 0

  if (!done) {
    say(c, MAIN, `${left}s`)
    say(c, SUB, 'light & wind', DIM)
  } else {
    say(c, MAIN, 'done!', GOLD)
  }
  bar(c, Math.min(t, WEATHER_MS) / WEATHER_MS)
}

// --- Scene registry --------------------------------------------------------

const SCENES: Record<SceneId, (c: Canvas, t: number) => void> = {
  eyes,
  sound,
  wood,
  breathe,
  outside,
  weather,
}

/**
 * The scene `id` at `t` ms after the break was shown, `width` columns wide.
 * `plain` draws it without colour (NO_COLOR): lit or unlit blocks only.
 */
export function drawScene(id: SceneId, t: number, width: number, plain = false): Frame {
  const c = canvas(width)
  SCENES[id]?.(c, Math.max(0, t))
  return toFrame(c, plain, HOLES)
}

/** The frame as text, one string per row (trailing spaces kept). */
export function toLines(f: Frame): string[] {
  return f.chars.map(row => row.join(''))
}

/** The frame packed for a Raster: base64 of `[codePoint, fg, bg]` u32 triplets. */
export function encode(f: Frame): string {
  const out = new Uint32Array(f.width * ROWS * 3)
  let i = 0
  for (let r = 0; r < ROWS; r++) {
    for (let x = 0; x < f.width; x++) {
      out[i++] = f.chars[r]![x]!.codePointAt(0)!
      out[i++] = f.fg[r]![x]!
      out[i++] = f.bg[r]![x]!
    }
  }
  const bytes = new Uint8Array(out.buffer)
  let bin = ''
  for (let j = 0; j < bytes.length; j += 0x8000) bin += String.fromCharCode(...bytes.subarray(j, j + 0x8000))
  return btoa(bin)
}
