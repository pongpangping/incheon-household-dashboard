import { useMemo, useState } from 'react'
import sigungu from './data/sigungu.json'
import summary from './data/sido_summary.json'
import trend from './data/trend.json'
import { computeComposite } from './lib/stats.js'

import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import CenterPanel from './components/CenterPanel.jsx'
import ChoroplethMap from './components/ChoroplethMap.jsx'

export default function App() {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [metric, setMetric] = useState('onePersonRate')
  const [avgFilter, setAvgFilter] = useState(null)  // null | 'above' | 'below' (인천 평균 대비)
  const [showGrid, setShowGrid] = useState(true)    // 격자 밀집도 히트맵(확대 시)
  const [weights, setWeights] = useState({ onePersonRate: 1, agedOneShareOfOne: 1, avgHouseholdSize: 1 })

  // 프론트 실시간 계산: 가중치가 바뀌면 브라우저가 종합지수를 다시 계산
  const rows = useMemo(() => computeComposite(sigungu, weights), [weights])

  const ranked = useMemo(
    () => [...rows].filter((r) => r.onePersonRate != null).sort((a, b) => b.onePersonRate - a.onePersonRate),
    [rows],
  )
  const sel = selected ?? ranked[0]?.code ?? rows[0].code

  const selectedRow = rows.find((r) => r.code === sel)
  const rank = ranked.findIndex((r) => r.code === sel) + 1
  const link = { selected: sel, hovered, onSelect: setSelected, onHover: setHovered }

  // 평균 대비 기준값: 종합지수는 계산값 평균, 그 외는 시 전체 요약
  const avgValue = metric === 'composite'
    ? rows.reduce((a, r) => a + (r.composite || 0), 0) / rows.length
    : summary[metric]

  return (
    <div className="shell">
      <Header summary={summary} />
      <div className="body body-3col">
        <Sidebar rows={rows} summary={summary} metricKey={metric} onMetric={setMetric}
          avgFilter={avgFilter} onAvgFilter={setAvgFilter} avgValue={avgValue}
          selected={sel} onSelect={setSelected}
          showGrid={showGrid} onToggleGrid={setShowGrid}
          weights={weights} onWeights={setWeights} />
        <ChoroplethMap rows={rows} {...link} metricKey={metric}
          avgFilter={avgFilter} avgValue={avgValue} showGrid={showGrid} />
        <CenterPanel rows={rows} summary={summary} trend={trend} link={link}
          metricKey={metric} avgFilter={avgFilter} avgValue={avgValue}
          selectedRow={selectedRow} rank={rank} total={ranked.length} weights={weights} />
      </div>
    </div>
  )
}
