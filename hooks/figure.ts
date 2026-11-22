// The character: a chunky, pixel-block figure styled in Sit Spot Club brand tokens
// (Forest Green, Warm Gold, Slate, and Off-White), posed by joints for calm nature
// and quiet sitting poses.

import { block, dot, line, mix, rect } from './pixels'
import type { Canvas, P } from './pixels'

// Sit Spot Club brand tokens
export const FOREST_GREEN = 0x2d5016 // #2D5016
export const WARM_GOLD = 0xc8a96e    // #C8A96E
export const SLATE = 0x475569        // Slate
export const OFF_WHITE = 0xf5f0e8    // #F5F0E8

export const BODY = FOREST_GREEN
/** The far arm and leg: the same forest green in shade, so the near limbs read in front. */
export const SHADE = mix(BODY, 0x000000, 0.35)
/** Creases and outlines on the body. */
export const DEEP = mix(BODY, 0x000000, 0.5)
export const LIGHT = mix(BODY, WARM_GOLD, 0.3)
/** The near arm: warm gold tint so it reads in front of the body. */
export const ARM = mix(BODY, WARM_GOLD, 0.25)
export const EYE = SLATE
export const GLINT = OFF_WHITE

/** A side view, facing right: the joints, in pixels. `neck` is the top of the torso. */
export type Body = {
  hip: P
  neck: P
  head: P
  knee: P
  foot: P
  knee2: P
  foot2: P
  elbow: P
  hand: P
  elbow2: P
  hand2: P
}

export type Look = {
  /** Eyes shut (a blink or calm meditation). */
  blink?: boolean
  /** Toes of the near (or far) foot pointing up: a heel on the floor, toes lifted. */
  toesUp?: boolean
  toesUp2?: boolean
  /** Up on the toes of that foot: the heel off the floor. */
  tiptoe?: boolean
  tiptoe2?: boolean
}

const add = (a: P, dx: number, dy: number): P => [a[0] + dx, a[1] + dy]

function leg(c: Canvas, hip: P, knee: P, foot: P, colour: number, toesUp = false, tiptoe = false) {
  line(c, hip, knee, colour, 2)
  line(c, knee, foot, colour, 2)
  // the foot, a short block toward the front
  if (toesUp) line(c, add(foot, 0.5, 0.5), add(foot, 2, -1), colour, 1)
  else if (tiptoe) line(c, add(foot, 0, 0.5), add(foot, 1.5, 1.5), colour, 1)
  else line(c, add(foot, 0, 1), add(foot, 2, 1), colour, 1)
}

function arm(c: Canvas, shoulder: P, elbow: P, hand: P, colour: number) {
  line(c, shoulder, elbow, colour, 2)
  line(c, elbow, hand, colour, 2)
}

/** The head from the side, centred on `at`: a wide block, one eye toward the front. */
export function headSide(c: Canvas, at: P, look: Look = {}) {
  block(c, at[0] - 4, at[1] - 3, 8, 6, BODY)
  if (look.blink) dot(c, at[0] + 2, at[1], EYE)
  else rect(c, at[0] + 2, at[1] - 1, 1, 2, EYE)
}

/** The whole figure, side on, facing right. */
export function figure(c: Canvas, b: Body, look: Look = {}) {
  const shoulder = add(b.neck, 0, 0.5)
  arm(c, add(shoulder, -0.5, 0), b.elbow2, b.hand2, SHADE)
  leg(c, add(b.hip, -0.5, 0), b.knee2, b.foot2, SHADE, look.toesUp2, look.tiptoe2)
  line(c, b.hip, b.neck, BODY, 4)
  leg(c, b.hip, b.knee, b.foot, BODY, look.toesUp, look.tiptoe)
  headSide(c, b.head, look)
  arm(c, shoulder, b.elbow, b.hand, ARM)
}

/** Standing tall at x, side on: peaceful upright posture. */
export function standing(x: number): Body {
  return {
    hip: [x, 12],
    neck: [x, 8],
    head: [x + 0.5, 3.5],
    knee: [x, 14.5],
    foot: [x, 17],
    knee2: [x - 1, 14.5],
    foot2: [x - 1, 17],
    elbow: [x + 0.5, 11],
    hand: [x + 1, 13.5],
    elbow2: [x - 0.5, 11],
    hand2: [x, 13.5],
  }
}

/** Seated on a chair whose seat is at x, side on. */
export function seated(x: number): Body {
  return {
    hip: [x, 12],
    neck: [x, 8],
    head: [x + 0.5, 3.5],
    knee: [x + 5, 12.5],
    foot: [x + 5, 17],
    knee2: [x + 4, 12.5],
    foot2: [x + 4, 17],
    elbow: [x + 1.5, 11],
    hand: [x + 4, 12],
    elbow2: [x + 0.5, 11],
    hand2: [x + 3, 12],
  }
}

/** Quiet mindful sitting pose: upright spine, hands resting peacefully in lap. */
export function sittingCalm(x: number): Body {
  return {
    hip: [x, 12.5],
    neck: [x, 8],
    head: [x + 0.5, 3.5],
    knee: [x + 4.5, 13.5],
    foot: [x + 4, 17],
    knee2: [x + 3.5, 13.5],
    foot2: [x + 3, 17],
    elbow: [x + 1.5, 11],
    hand: [x + 3.5, 13],
    elbow2: [x + 0.5, 11],
    hand2: [x + 2.5, 13],
  }
}

/** Seated desk grounding pose: hands extended forward resting on real wood. */
export function sittingGround(x: number): Body {
  return {
    hip: [x, 12],
    neck: [x + 1, 8],
    head: [x + 1.5, 3.8],
    knee: [x + 5, 12.5],
    foot: [x + 5, 17],
    knee2: [x + 4, 12.5],
    foot2: [x + 4, 17],
    elbow: [x + 2.5, 10.5],
    hand: [x + 6, 11],
    elbow2: [x + 1.5, 10.5],
    hand2: [x + 5, 11],
  }
}

/** Two big eyes in a face seen from the front, `look` pixels to the side. */
export function eyesFront(c: Canvas, left: P, right: P, h: number, look: number, blink: boolean) {
  for (const e of [left, right]) {
    if (blink) {
      rect(c, e[0] + look, e[1] + h - 1, 2, 1, EYE)
      continue
    }
    rect(c, e[0] + look, e[1], 2, h, EYE)
    dot(c, e[0] + look + (look >= 0 ? 1 : 0), e[1], GLINT)
  }
}
