import { METRICS } from '../lib/metrics.js'
import { pct } from '../lib/format.js'

const TYPES = ['청년형', '고령형', '균형형']
const TYPE_COLOR = { '청년형': '#2a78d6', '고령형': '#eb6834', '균형형': '#8a909c' }

export default function Sidebar({
  rows, summary, metricKey, onMetric, typeFilter, onTypeFilter,
}) {
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0]
  const vals = rows.map((r) => r[metricKey]).filter((x) => x != null)
  const min = Math.min(...vals), max = Math.max(...vals)
  const count = (t) => rows.filter((r) => r.oneType === t).length

  return (
    <aside className="sidebar">
      <div className="sb-badge"><i>지표</i><span>지도에 표시할 지표를 선택하세요</span></div>

      <div>
        <div className="sb-sec-title">지도 지표</div>
        <div className="metric-list">
          {METRICS.map((m) => (
            <button key={m.key} className={`metric-item${m.key === metricKey ? ' active' : ''}`}
              onClick={() => onMetric(m.key)}>
              <span className="mi-name">{m.label}</span>
              <span className="mi-desc">{m.desc}</span>
            </button>
          ))}
        </div>
        <div className="sb-legend">
          <span>{metric.fmt ? metric.fmt(min) : min}</span>
          <div className="lg-bar" />
          <span>{metric.fmt ? metric.fmt(max) : max}</span>
        </div>
      </div>

      <div>
        <div className="sb-sec-title">정책 유형 필터</div>
        <div className="type-chips">
          <button className={!typeFilter ? 'active' : ''} onClick={() => onTypeFilter(null)}>전체</button>
          {TYPES.map((t) => (
            <button key={t} className={typeFilter === t ? 'active' : ''}
              onClick={() => onTypeFilter(typeFilter === t ? null : t)}
              style={typeFilter === t ? { color: TYPE_COLOR[t] } : undefined}>
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
