export type SceneId =
  | 'eyes'
  | 'sound'
  | 'wood'
  | 'breathe'
  | 'outside'
  | 'weather'

/**
 * One break: what to do (`how`) and what it does for the body and mind (`does`).
 * `scene` picks its animation. A break stored by an older version may have no
 * scene, a scene this version no longer draws, or an optional `skip`/`detail` line;
 * it still shows.
 */
export type Activity = { scene?: SceneId; title: string; how: string; does: string; skip?: string }

declare module 'claude-code' {
  interface PluginState {
    'sit-spot-break': { current: Activity | null }
  }
}
