import { useState } from 'react'
import { METRICS, metricBy } from '../lib/metrics.js'
import { pct } from '../lib/format.js'
import { COMPOSITE_INDICATORS } from '../lib/stats.js'

export default function Sidebar({
  rows, summary, metricKey, onMetric, avgFilter, onAvgFilter, avgValue, selected, onSelect,
  showGrid, onToggleGrid, weights, onWeights,
}) {
  const metric = metricBy(metricKey)
  const vals = rows.map((r) => r[metricKey]).filter((x) => x != null)
  const min = Math.min(...vals), max = Math.max(...vals)
  const ordered = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  const nAbove = rows.filter((r) => r[metricKey] >= avgValue).length

  // 아코디언 상태: 전체 패널 열림/닫힘 + 펼쳐진 지표(하나만)
  const [panelOpen, setPanelOpen] = useState(true)
  const [openKey, setOpenKey] = useState(metricKey)

  const clickMetric = (k) => {
    if (openKey === k) { setOpenKey(null); return }   // 이미 열린 항목 다시 누르면 접힘
    onMetric(k); setOpenKey(k)                         // 선택 + 해당 항목만 펼침(나머지 접힘)
  }

  return (
    <aside className="sidebar">
      <div className="sb-badge"><i>지표</i><span>지도에 표시할 지표를 선택하세요</span></div>

      {/* 지도 지표 — 아코디언 (선택 항목만 펼침 / 다시 누르면 접힘) */}
      <div className="acc">
        <button className="acc-head" onClick={() => setPanelOpen((o) => !o)}>
          <span className="acc-ic">◧</span><span className="acc-title">지도 지표</span>
          <span className="acc-minus">{panelOpen ? '–' : '+'}</span>
        </button>
        {panelOpen && (
          <div className="acc-body">
            {METRICS.map((m) => {
              const isOpen = openKey === m.key
              const isActive = metricKey === m.key
              return (
                <div key={m.key} className={`acc-item${isActive ? ' active' : ''}${isOpen ? ' open' : ''}`}>
                  <button className="ai-head" onClick={() => clickMetric(m.key)}>
                    <span className="ai-name">{m.label}</span>
                    <span className="ai-chev">{isOpen ? '▾' : '▸'}</span>
                  </button>
                  {isOpen && (
                    <div className="ai-detail">
                      <div className="ai-desc">{m.desc}</div>
                      {m.key === 'composite' && (
                        <div className="wpanel">
                          <div className="wpanel-h">가중치 조절 <em>브라우저 실시간 계산</em></div>
                          {COMPOSITE_INDICATORS.map((ind) => (
                            <div className="wrow" key={ind.key}>
                              <div className="wrow-top">
                                <span>{ind.label}{ind.invert ? ' (작을수록↑)' : ''}</span>
                                <b>{weights[ind.key]}</b>
                              </div>
                              <input type="range" min="0" max="3" step="1" value={weights[ind.key]}
                                onChange={(e) => onWeights({ ...weights, [ind.key]: Number(e.target.value) })} />
                            </div>
                          ))}
                          <div className="wpanel-note">정규화(min-max) 후 가중 평균 → 0~100점. 지도·순위가 즉시 갱신됩니다.</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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

        {/* 격자 밀집도 토글 */}
        <button className={`grid-toggle${showGrid ? ' on' : ''}`}
          onClick={() => onToggleGrid(!showGrid)}>
          <span className="gt-txt">
            <b>격자 밀집도</b>
            <em>구 확대 시 500m 격자로 1인가구 밀도 표시</em>
          </span>
          <span className="gt-sw"><i /></span>
        </button>
      </div>

      <div className="sb-summary">
        <div><span>1인가구</span><b>{pct(summary.onePersonRate)}</b></div>
        <div><span>세대당</span><b>{summary.avgHouseholdSize}명</b></div>
        <div><span>고령1인</span><b>{pct(summary.agedOneShareOfOne)}</b></div>
      </div>
    </aside>
  )
}
