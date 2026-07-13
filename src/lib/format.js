// 숫자 포맷 유틸
export const comma = (n) =>
  n == null ? '—' : Number(n).toLocaleString('ko-KR')

export const pct = (n, d = 1) =>
  n == null ? '—' : `${Number(n).toFixed(d)}%`

export const man = (n) =>
  n == null ? '—' : `${(n / 10000).toFixed(1)}만`

// 1인가구 비율 → 파란 sequential ramp 색상 (dataviz 검증 팔레트)
const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#2a78d6', '#1c5cab', '#104281']
export function rampColor(value, min, max) {
  if (value == null || max === min) return 'rgba(20,30,60,0.08)'
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const idx = Math.round(t * (SEQ.length - 1))
  return SEQ[idx]
}
