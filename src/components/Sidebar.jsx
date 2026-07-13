import { METRICS } from '../lib/metrics.js'
import { pct } from '../lib/format.js'

const TYPES = ['청년형', '고령형', '균형형']
const TYPE_COLOR = { '청년형': '#008AE0', '고령형': '#FF8A00', '균형형': '#94A3B8' }

export default function Sidebar({
  rows, summary, metricKey, onMetric, typeFilter, onTypeFilter, selected, onSelect,
}) {
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0]
  const vals = rows.map((r) => r[metricKey]).filter((x) => x != null)
  const min = Math.min(...vals), max = Math.max(...vals)
  const count = (t) => rows.filter((r) => r.oneType === t).length
  const ordered = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  return (
    <aside className="sidebar">
      <div className="sb-badge"><i>지표</i><span>지도에 표시할 지표를 선택하세요</span></div>

      {/* 지도 지표 — AR6 아코디언(활성 헤더 + 하위 항목) */}
      <div className="acc">
        <div className="acc-head">
          <span className="acc-ic">◧</span><span className="acc-title">지도 지표</span><span className="acc-minus">–</span>
        </div>
        <div className="acc-body">
          {METRICS.map((m) => (
            <button key={m.key} className={`acc-item${m.key === metricKey ? ' active' : ''}`}
              onClick={() => onMetric(m.key)}>
              <span className="ai-name">{m.label}</span>
              <span className="ai-desc">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sb-legend">
        <span>{metric.fmt ? metric.fmt(min) : min}</span>
        <div className="lg-bar" />
        <span>{metric.fmt ? metric.fmt(max) : max}</span>
      </div>

      <div className="sb-block">
        <div className="sb-label">데이터 선택</div>

        {/* 시군구 선택 드롭다운 (AR6 dropdown 형) */}
        <label className="dropdown">
          <span className="dd-label">시군구 선택</span>
          <span className="dd-value">{rows.find((r) => r.code === selected)?.name ?? '선택'}
            <span className="dd-caret">⌄</span></span>
          <select value={selected} onChange={(e) => onSelect(e.target.value)}>
            {ordered.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
        </label>

        {/* 정책 유형 필터 (세그먼트 토글) */}
        <div className="dd-sublabel">정책 유형 필터</div>
        <div className="seg-toggle">
          <button className={!typeFilter ? 'active' : ''} onClick={() => onTypeFilter(null)}>전체</button>
          {TYPES.map((t) => (
            <button key={t} className={typeFilter === t ? 'active' : ''}
              onClick={() => onTypeFilter(typeFilter === t ? null : t)}
              style={typeFilter === t ? { color: TYPE_COLOR[t], borderColor: TYPE_COLOR[t] } : undefined}>
              <i style={{ background: TYPE_COLOR[t] }} />{t}<em>{count(t)}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="sb-summary">
        <div><span>1인가구</span><b>{pct(summary.onePersonRate)}</b></div>
        <div><span>세대당</span><b>{summary.avgHouseholdSize}명</b></div>
        <div><span>고령1인</span><b>{pct(summary.agedOneShareOfOne)}</b></div>
      </div>
    </aside>
  )
}
