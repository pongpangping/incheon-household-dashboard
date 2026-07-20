// 프론트엔드(클라이언트)에서 실시간으로 계산하는 통계 유틸
// — 빌드 전 Python 전처리와 별개로, 사용자 입력에 따라 브라우저가 값을 다시 계산한다.

// 피어슨 상관계수
export function pearson(xs, ys) {
  const n = xs.length
  if (n < 2) return null
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy
  }
  const d = Math.sqrt(sxx * syy)
  return d === 0 ? null : sxy / d
}

// 최소제곱 선형회귀 y = slope·x + intercept
export function linreg(xs, ys) {
  const n = xs.length
  if (n < 2) return null
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0, sxx = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    sxy += dx * (ys[i] - my); sxx += dx * dx
  }
  if (sxx === 0) return null
  const slope = sxy / sxx
  return { slope, intercept: my - slope * mx }
}

// 상관 강도 설명(한국어)
export function corrLabel(r) {
  if (r == null) return '—'
  const a = Math.abs(r)
  const strength = a >= 0.7 ? '강한' : a >= 0.4 ? '뚜렷한' : a >= 0.2 ? '약한' : '거의 없는'
  const dir = r > 0 ? '양의' : r < 0 ? '음의' : ''
  return `${strength} ${dir} 상관`.trim()
}

// ── 가중 종합지수 ─────────────────────────────────────────────
// 여러 지표를 0~1로 정규화(min-max)한 뒤 가중 평균해 0~100 점수로 만든다.
// invert=true 인 지표는 값이 작을수록 점수가 높아진다(예: 세대당 인구).
export const COMPOSITE_INDICATORS = [
  { key: 'onePersonRate', label: '1인가구 비율', invert: false },
  { key: 'agedOneShareOfOne', label: '고령 1인가구 비중', invert: false },
  { key: 'avgHouseholdSize', label: '세대당 인구', invert: true },
]

export function computeComposite(rows, weights) {
  // 지표별 min/max
  const range = {}
  for (const ind of COMPOSITE_INDICATORS) {
    const vals = rows.map((r) => r[ind.key]).filter((v) => v != null)
    range[ind.key] = { min: Math.min(...vals), max: Math.max(...vals) }
  }
  const wSum = COMPOSITE_INDICATORS.reduce((a, ind) => a + (weights[ind.key] || 0), 0)
  return rows.map((r) => {
    if (wSum === 0) return { ...r, composite: 0 }
    let acc = 0
    for (const ind of COMPOSITE_INDICATORS) {
      const w = weights[ind.key] || 0
      if (!w) continue
      const { min, max } = range[ind.key]
      const v = r[ind.key]
      let norm = max === min || v == null ? 0.5 : (v - min) / (max - min)
      if (ind.invert) norm = 1 - norm
      acc += w * norm
    }
    return { ...r, composite: Math.round((acc / wSum) * 1000) / 10 } // 0~100, 소수1
  })
}
