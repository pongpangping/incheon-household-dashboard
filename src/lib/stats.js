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

// ── 데이터 기반 군집 유형화 (k-means) ────────────────────────────────
// 3개 지표(1인가구율·고령1인비중·세대당인구)를 정규화해 시군구를 유형으로 묶는다.
// 초기값을 결정적으로 잡아 매번 같은 결과(재현성). AI 임의분류가 아니라 통계 방법.
const KM_FEATS = ['onePersonRate', 'agedOneShareOfOne', 'avgHouseholdSize']
const KM_COLORS = ['#0B93EE', '#F5760D', '#8B5CF6', '#10B981']

export function kmeans(rows, k = 3) {
  const pts = rows.filter((r) => KM_FEATS.every((f) => r[f] != null))
  if (pts.length < k) return null
  const range = {}
  for (const f of KM_FEATS) { const v = pts.map((r) => r[f]); range[f] = { min: Math.min(...v), max: Math.max(...v) } }
  const norm = (r) => KM_FEATS.map((f) => { const { min, max } = range[f]; return max === min ? 0.5 : (r[f] - min) / (max - min) })
  const X = pts.map((r) => ({ code: r.code, name: r.name, v: norm(r), row: r }))
  const dist = (a, b) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0))
  // 결정적 초기화: 1인가구율 정규값 기준 정렬 후 균등 간격 k개
  const sorted = [...X].sort((a, b) => a.v[0] - b.v[0])
  let cen = Array.from({ length: k }, (_, i) => sorted[Math.round(i * (sorted.length - 1) / (k - 1))].v.slice())
  let assign = X.map(() => 0)
  for (let it = 0; it < 40; it++) {
    const na = X.map((p) => { let bi = 0, bd = Infinity; cen.forEach((c, ci) => { const d = dist(p.v, c); if (d < bd) { bd = d; bi = ci } }); return bi })
    const nc = cen.map((c, ci) => {
      const mem = X.filter((_, i) => na[i] === ci)
      if (!mem.length) return c
      return c.map((_, d) => mem.reduce((s, m) => s + m.v[d], 0) / mem.length)
    })
    const done = JSON.stringify(nc) === JSON.stringify(cen)
    cen = nc; assign = na
    if (done) break
  }
  let clusters = cen.map((c, ci) => {
    const mem = X.filter((_, i) => assign[i] === ci)
    return {
      id: ci, color: KM_COLORS[ci % KM_COLORS.length],
      members: mem.map((m) => ({ name: m.name, code: m.code })),
      avg: {
        onePersonRate: mem.reduce((s, m) => s + m.row.onePersonRate, 0) / (mem.length || 1),
        agedOneShareOfOne: mem.reduce((s, m) => s + m.row.agedOneShareOfOne, 0) / (mem.length || 1),
        avgHouseholdSize: mem.reduce((s, m) => s + m.row.avgHouseholdSize, 0) / (mem.length || 1),
      },
    }
  }).filter((c) => c.members.length)
  // 유형명: 군집끼리 상대 비교로 부여(중복 방지, 데이터 기반)
  clusters.forEach((c) => { c.name = '혼합형' })
  const byHH = [...clusters].sort((a, b) => b.avg.avgHouseholdSize - a.avg.avgHouseholdSize)
  if (byHH[0]) byHH[0].name = '가족·정주형'                              // 세대당 인구 최대
  const rest = clusters.filter((c) => c !== byHH[0]).sort((a, b) => b.avg.agedOneShareOfOne - a.avg.agedOneShareOfOne)
  if (rest[0]) rest[0].name = '고령·1인 집중형'                          // 남은 것 중 고령 최대
  if (rest[1]) rest[1].name = '청년·1인 집중형'                          // 그다음
  for (let i = 2; i < rest.length; i++) rest[i].name = '혼합형'
  const byCode = {}
  X.forEach((p, i) => { byCode[p.code] = assign[i] })
  return { clusters, byCode }
}

// 선택 구의 집중지수를 지표별 기여도로 분해 (블랙박스가 아니게)
export function compositeBreakdown(rows, row, weights) {
  if (!row) return null
  const range = {}
  for (const ind of COMPOSITE_INDICATORS) {
    const vals = rows.map((r) => r[ind.key]).filter((v) => v != null)
    range[ind.key] = { min: Math.min(...vals), max: Math.max(...vals) }
  }
  const wSum = COMPOSITE_INDICATORS.reduce((a, ind) => a + (weights[ind.key] || 0), 0)
  const parts = COMPOSITE_INDICATORS.map((ind) => {
    const w = weights[ind.key] || 0
    const { min, max } = range[ind.key]
    const v = row[ind.key]
    let norm = max === min || v == null ? 0.5 : (v - min) / (max - min)
    if (ind.invert) norm = 1 - norm
    const contrib = wSum ? (w * norm / wSum) * 100 : 0
    return { key: ind.key, label: ind.label, invert: ind.invert, weight: w, contrib: Math.round(contrib * 10) / 10 }
  })
  const total = Math.round(parts.reduce((a, p) => a + p.contrib, 0))
  return { parts, total }
}

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
