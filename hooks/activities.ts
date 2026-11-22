import type { Activity } from '../types'

/**
 * Every break, in the order the README and the preview list them. Each says
 * what to do, what it does for the body, and where skipping it leads.
 */
export const ACTIVITIES: readonly Activity[] = [
  {
    scene: 'eyes',
    title: 'Eye rest (20-20-20)',
    how: 'Gaze at the sky, clouds, or furthest tree for 20 seconds.',
    does: 'Lets your optic focus muscles unclench and softens screen fatigue.',
    skip: 'Skip it and your eyes stay locked to the glare.',
  },
  {
    scene: 'sound',
    title: 'Sensory gating',
    how: 'Close eyes for 15 seconds and notice the furthest external sound.',
    does: 'Expands your auditory awareness and quiets internal chatter.',
    skip: 'Skip it and mental noise runs the show.',
  },
  {
    scene: 'wood',
    title: 'Touching wood',
    how: 'Rest your hands on real wood: desk, pencil, or windowsill.',
    does: 'Grounds your nervous system through natural tactile contact.',
    skip: 'Skip it and you stay disconnected in plastic and glass.',
  },
  {
    scene: 'breathe',
    title: 'Ocean wave breath',
    how: 'Inhale for 4 seconds, hold, exhale for 4 seconds like an ocean wave.',
    does: 'Steadies your heart rate and downregulates stress.',
    skip: 'Skip it and shallow breathing keeps you on edge.',
  },
  {
    scene: 'outside',
    title: 'Step outside',
    how: 'Take a 60-second micro-pause to step to the porch, balcony, or doorstep.',
    does: 'Resets your circadian rhythm with fresh open air and natural light.',
    skip: 'Skip it and stale indoor air drains your afternoon energy.',
  },
  {
    scene: 'weather',
    title: 'Weather / light check',
    how: 'Observe daylight, wind patterns, and sky movement.',
    does: 'Connects your mind to the changing outdoor world beyond the monitor.',
    skip: 'Skip it and your sense of time shrinks to the screen.',
  },
]

/**
 * The words after a break's title. A break stored by an older version may
 * hold one `detail` line instead, or miss a field: what is there is shown.
 */
export function describe(activity: Activity): string {
  const a = activity as Partial<Activity> & { detail?: unknown }
  const parts = [a.how, a.does, a.skip].filter((s): s is string => typeof s === 'string' && s !== '')
  if (parts.length === 0 && typeof a.detail === 'string') return a.detail
  return parts.join(' ')
}
