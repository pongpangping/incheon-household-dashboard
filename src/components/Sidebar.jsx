import { METRICS, metricBy } from '../lib/metrics.js'
import { pct } from '../lib/format.js'

export default function Sidebar({
  rows, summary, metricKey, onMetric, avgFilter, onAvgFilter, avgValue, selected, onSelect,
}) {
  const metric = metricBy(metricKey)
  const vals = rows.map((r) => r[metricKey]).filter((x) => x != null)
  const min = Math.min(...vals), max = Math.max(...vals)
  const ordered = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  const nAbove = rows.filter((r) => r[metricKey] >= avgValue).length

  return (
    <aside className="sidebar">
      <div className="sb-badge"><i>지표</i><span>지도에 표시할 지표를 선택하세요</span></div>

      {/* 지도 지표 — 아코디언 */}
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
        <span>{metric.fmt(min)}</span>
        <div className="lg-bar" />
        <span>{metric.fmt(max)}</span>
      </div>

      <div className="sb-block">
        <div className="sb-label">데이터 선택</div>

        {/* 시군구 선택 드롭다운 */}
        <label className="dropdown">
          <span className="dd-label">시군구 선택</span>
          <span className="dd-value">{rows.find((r) => r.code === selected)?.name ?? '선택'}
            <span className="dd-caret">⌄</span></span>
          <select value={selected} onChange={(e) => onSelect(e.target.value)}>
            {ordered.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
        </label>

        {/* 인천 평균 대비 필터 (데이터 기반) */}
        <div className="dd-sublabel">인천 평균 대비 · {metric.fmt(avgValue)}</div>
        <div className="seg-toggle">
          <button className={!avgFilter ? 'active' : ''} onClick={() => onAvgFilter(null)}>전체</button>
          <button className={avgFilter === 'above' ? 'active' : ''}
            onClick={() => onAvgFilter(avgFilter === 'above' ? null : 'above')}>
            평균 이상<em>{nAbove}</em></button>
          <button className={avgFilter === 'below' ? 'active' : ''}
            onClick={() => onAvgFilter(avgFilter === 'below' ? null : 'below')}>
            평균 미만<em>{rows.length - nAbove}</em></button>
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
