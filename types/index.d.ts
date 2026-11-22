export type SceneId =
  | 'eyes'
  | 'sound'
  | 'wood'
  | 'breathe'
  | 'outside'
  | 'weather'

/**
 * One break: what to do (`how`), what it does for the body (`does`) and what
 * skipping it leads to (`skip`). `scene` picks its animation. A break stored
 * by an older version may have no scene, a scene this version no longer
 * draws, or a single `detail` line instead of the three; it still shows.
 */
export type Activity = { scene?: SceneId; title: string; how: string; does: string; skip: string }

declare module 'claude-code' {
  interface PluginState {
    'sit-spot-break': { current: Activity | null }
  }
}
