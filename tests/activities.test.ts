import { expect, test } from 'claude-code/testing'

import { ACTIVITIES, describe } from '../hooks/activities'
import type { Activity } from '../types'

test('every break says what to do (action) and what it does for you (benefit)', () => {
  for (const a of ACTIVITIES) {
    expect(a.title.length).toBeGreaterThan(0)
    expect(a.how.length).toBeGreaterThan(0)
    expect(a.does.length).toBeGreaterThan(0)
    expect(describe(a)).toBe(`${a.how} ${a.does}`)
  }
})

test('titles are unique, and every text is plain English ASCII without negative framing', () => {
  expect(new Set(ACTIVITIES.map(a => a.title)).size).toBe(ACTIVITIES.length)
  for (const a of ACTIVITIES) {
    for (const s of [a.title, a.how, a.does]) {
      expect(/^[ -~]+$/.test(s)).toBe(true)
      expect(s.toLowerCase()).not.toContain('skip it and')
    }
  }
})

test('the practices cover eyes, sound, wood, breathe, outside and weather', () => {
  const scenes = new Set(ACTIVITIES.map(a => a.scene))
  for (const s of ['eyes', 'sound', 'wood', 'breathe', 'outside', 'weather'] as const) {
    expect(scenes.has(s)).toBe(true)
  }
})

test('a break stored by an older version still has words', () => {
  const legacy = { scene: 'stretch', title: 'Stretch', detail: 'Reach up.' } as unknown as Activity
  expect(describe(legacy)).toBe('Reach up.')
  expect(describe({ title: 'x' } as unknown as Activity)).toBe('')
})
