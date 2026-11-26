import type { Activity } from '../types'

/**
 * Every break, in the order the README and the preview list them.
 * Each says what to do (action) and what it does for you (benefit).
 * Restorative, gentle language only: no punitive or negative framing.
 */
export const ACTIVITIES: readonly Activity[] = [
  {
    scene: 'eyes',
    title: 'Eye rest (20-20-20)',
    how: 'Gaze at the sky, clouds, or furthest tree for 20 seconds.',
    does: 'Lets your optic focus muscles unclench and softens screen fatigue.',
  },
  {
    scene: 'sound',
    title: 'Sensory gating',
    how: 'Close eyes for 15 seconds and notice the furthest external sound.',
    does: 'Expands your auditory awareness and quiets internal chatter.',
  },
  {
    scene: 'wood',
    title: 'Touching wood',
    how: 'Rest your hands on real wood: desk, pencil, or windowsill.',
    does: 'Grounds your nervous system through natural tactile contact.',
  },
  {
    scene: 'breathe',
    title: 'Ocean wave breath',
    how: 'Inhale for 4 seconds, hold, exhale for 4 seconds like an ocean wave.',
    does: 'Steadies your heart rate and downregulates stress.',
  },
  {
    scene: 'outside',
    title: 'Step outside',
    how: 'Take a 60-second micro-pause to step to the porch, balcony, or doorstep.',
    does: 'Resets your circadian rhythm with fresh open air and natural light.',
  },
  {
    scene: 'weather',
    title: 'Weather / light check',
    how: 'Observe daylight, wind patterns, and sky movement.',
    does: 'Connects your mind to the changing outdoor world beyond the monitor.',
  },
]

/**
 * The words after a break's title: Action (how) + Benefit (does).
 * A break stored by an older version may hold one `detail` line instead,
 * or miss a field: what is there is shown.
 */
export function describe(activity: Activity): string {
  const a = activity as Partial<Activity> & { detail?: unknown }
  const parts = [a.how, a.does].filter((s): s is string => typeof s === 'string' && s !== '')
  if (parts.length === 0 && typeof a.detail === 'string') return a.detail
  return parts.join(' ')
}
