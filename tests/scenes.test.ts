import { expect, test } from 'claude-code/testing'

import { ACTIVITIES } from '../hooks/activities'
import {
  BODY,
  BREATHE_ROUNDS,
  DEFAULT,
  drawScene,
  encode,
  eyesLeft,
  EYES_MS,
  hasScene,
  MAX_WIDTH,
  OUTSIDE_MS,
  outsideLeft,
  ROWS,
  SCENE_IDS,
  sceneWidth,
  soundLeft,
  SOUND_MS,
  toLines,
  WAVE_MS,
  weatherLeft,
  WEATHER_MS,
  woodLeft,
  WOOD_MS,
} from '../hooks/scenes'

const WIDTHS = [50, 80, MAX_WIDTH]
const TIMES = Array.from({ length: 40 }, (_, i) => i * 733)

const text = (id: (typeof SCENE_IDS)[number], t: number, width = 80) => toLines(drawScene(id, t, width)).join('\n')

test('every break has its own scene, and every scene a break', () => {
  expect(ACTIVITIES.map(a => a.scene)).toEqual([...SCENE_IDS])
})

/** Half blocks for the pixels, and the progress bar's two lines. */
const DRAWN = new Set(['\u2580', '\u2584', '\u2588', '\u2501', '\u2500'])
const okChar = (ch: string) => ch.length === 1 && ((ch >= ' ' && ch <= '~') || DRAWN.has(ch))
const okColour = (c: number) => c === DEFAULT || (c >= 0 && c <= 0xffffff)

test('every frame is ROWS rows of exactly the width, half blocks or printable ASCII, valid colours', () => {
  for (const id of SCENE_IDS) {
    for (const width of WIDTHS) {
      for (const t of TIMES) {
        const f = drawScene(id, t, width)
        expect(f.chars).toHaveLength(ROWS)
        expect(f.fg).toHaveLength(ROWS)
        expect(f.bg).toHaveLength(ROWS)
        for (let r = 0; r < ROWS; r++) {
          expect(f.chars[r]).toHaveLength(width)
          expect(f.fg[r]).toHaveLength(width)
          expect(f.bg[r]).toHaveLength(width)
          expect(f.chars[r]!.every(okChar)).toBe(true)
          expect(f.fg[r]!.every(okColour)).toBe(true)
          expect(f.bg[r]!.every(okColour)).toBe(true)
        }
      }
    }
  }
})

test('every scene draws the character in half-block pixels', () => {
  for (const id of SCENE_IDS) {
    const f = drawScene(id, 1500, 80)
    expect(f.fg.flat().filter(c => c === BODY).length).toBeGreaterThan(20)
    expect(toLines(f).join('').match(/[\u2580\u2584\u2588]/g)?.length ?? 0).toBeGreaterThan(20)
  }
})

test('NO_COLOR: every cell in the terminal colour, the figure still drawn, the eyes left as holes', () => {
  for (const id of SCENE_IDS) {
    for (const t of [0, 1500, 7000]) {
      const plain = drawScene(id, t, 80, true)
      expect(plain.fg.flat().every(c => c === DEFAULT)).toBe(true)
      expect(plain.bg.flat().every(c => c === DEFAULT)).toBe(true)
      // the words are the same as in colour
      const words = (f: ReturnType<typeof drawScene>) => toLines(f).join('\n').replace(/[\u2580\u2584\u2588\u2501\u2500]/g, ' ')
      expect(words(plain)).toBe(words(drawScene(id, t, 80)))
    }
  }
  // the eyes: the face in colour has dark pixels; plain, those are unlit
  const colour = toLines(drawScene('eyes', 0, 80)).join('')
  const plain = toLines(drawScene('eyes', 0, 80, true)).join('')
  expect(plain).not.toBe(colour)
})

test('every scene moves: frames differ over a few seconds', () => {
  for (const id of SCENE_IDS) {
    const frames = new Set(TIMES.slice(0, 8).map(t => text(id, t)))
    expect(frames.size).toBeGreaterThan(1)
  }
})

test('the same moment draws the same frame', () => {
  for (const id of SCENE_IDS) expect(text(id, 4321)).toBe(text(id, 4321))
})

test('the eyes break counts 20 seconds down to 0, then says done', () => {
  expect(eyesLeft(0)).toBe(20)
  expect(eyesLeft(999)).toBe(20)
  expect(eyesLeft(1000)).toBe(19)
  expect(eyesLeft(19_001)).toBe(1)
  expect(eyesLeft(EYES_MS)).toBe(0)
  expect(eyesLeft(EYES_MS * 5)).toBe(0)
  expect(text('eyes', 0)).toContain('20s')
  expect(text('eyes', 10_500)).toContain('10s')
  expect(text('eyes', 19_500)).toContain('1s')
  expect(text('eyes', EYES_MS)).toContain('done!')
  expect(text('eyes', EYES_MS)).not.toContain('0s')
})

test('sensory gating counts 15 seconds down to 0, then says done', () => {
  expect(soundLeft(0)).toBe(15)
  expect(soundLeft(14_001)).toBe(1)
  expect(soundLeft(SOUND_MS)).toBe(0)
  expect(text('sound', 0)).toContain('15s')
  expect(text('sound', 0)).toContain('furthest sound')
  expect(text('sound', SOUND_MS)).toContain('done!')
})

test('touching wood grounds into real wood', () => {
  expect(woodLeft(0)).toBe(15)
  expect(woodLeft(WOOD_MS)).toBe(0)
  expect(text('wood', 0)).toContain('touching wood')
  expect(text('wood', WOOD_MS)).toContain('grounded!')
})

test('ocean wave breath: in, hold, out, 4 seconds each, three rounds, then done', () => {
  expect(text('breathe', 0)).toContain('inhale wave 4')
  expect(text('breathe', 3_500)).toContain('inhale wave 1')
  expect(text('breathe', WAVE_MS)).toContain('hold crest 4')
  expect(text('breathe', WAVE_MS * 2)).toContain('exhale wave 4')
  expect(text('breathe', 0)).toContain('round 1/3')
  expect(text('breathe', WAVE_MS * 3)).toContain('round 2/3')
  expect(text('breathe', WAVE_MS * 6)).toContain('round 3/3')
  expect(text('breathe', WAVE_MS * 9)).toContain('done!')
})

test('step outside: 60-second micro-pause countdown', () => {
  expect(outsideLeft(0)).toBe(60)
  expect(outsideLeft(59_001)).toBe(1)
  expect(outsideLeft(OUTSIDE_MS)).toBe(0)
  expect(text('outside', 0)).toContain('60s')
  expect(text('outside', 0)).toContain('step outside')
  expect(text('outside', OUTSIDE_MS)).toContain('done!')
})

test('weather / light check: observes daylight, wind and sky', () => {
  expect(weatherLeft(0)).toBe(20)
  expect(weatherLeft(WEATHER_MS)).toBe(0)
  expect(text('weather', 0)).toContain('20s')
  expect(text('weather', 0)).toContain('light & wind')
  expect(text('weather', WEATHER_MS)).toContain('done!')
})

test('too narrow for a scene: none; wide: capped', () => {
  expect(sceneWidth(undefined)).toBe(null)
  expect(sceneWidth(Number.NaN)).toBe(null)
  expect(sceneWidth(49)).toBe(null)
  expect(sceneWidth(50)).toBe(50)
  expect(sceneWidth(80)).toBe(80)
  expect(sceneWidth(500)).toBe(MAX_WIDTH)
})

test('encode packs width x ROWS cells of [codePoint, fg, bg]', () => {
  const f = drawScene('wood', 0, 60)
  const bytes = Uint8Array.from(atob(encode(f)), c => c.charCodeAt(0))
  const cells = new Uint32Array(bytes.buffer)
  expect(cells.length).toBe(60 * ROWS * 3)
  const lines = toLines(f)
  const r = lines.findIndex(l => l.includes('\u2580') || l.includes('\u2588'))
  const px = lines[r]!.search(/[\u2580\u2588]/)
  const j = (r * 60 + px) * 3
  expect(cells[j]).toBe(f.chars[r]![px]!.codePointAt(0))
  expect(cells[j + 1]).toBe(f.fg[r]![px])
  expect(cells[j + 2]).toBe(f.bg[r]![px])
})

test('hasScene: only the scenes this version draws; an unknown one draws an empty floor', () => {
  for (const id of SCENE_IDS) expect(hasScene(id)).toBe(true)
  for (const bad of ['stretch', '', undefined, null, 3]) expect(hasScene(bad)).toBe(false)
  const f = drawScene('stretch' as never, 0, 60)
  expect(toLines(f).slice(0, ROWS - 1).every(l => l.trim() === '')).toBe(true)
})
