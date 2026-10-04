export const dialPages = [
  { value: 'home', label: 'Home' },
  { value: 'cv', label: 'CV' },
  { value: 'blog', label: 'Blog' },
] as const

export type NavigationPage = (typeof dialPages)[number]['value']

export function clampDialAngle(angle: number) {
  return Math.max(-60, Math.min(60, angle))
}

export function dialAngle(index: number) {
  return -60 + index * 60
}

export function dialPosition(angle: number) {
  return Math.round((clampDialAngle(angle) + 60) / 60)
}

export function angularDelta(from: number, to: number) {
  return ((((to - from + 180) % 360) + 360) % 360) - 180
}
