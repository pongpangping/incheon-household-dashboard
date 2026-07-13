import { useMemo, useState } from 'react'
import sigungu from './data/sigungu.json'
import summary from './data/sido_summary.json'
import trend from './data/trend.json'

import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import CenterPanel from './components/CenterPanel.jsx'
import ChoroplethMap from './components/ChoroplethMap.jsx'

export default function App() {
  const ranked = useMemo(
    () => [...sigungu].filter((r) => r.onePersonRate != null)
      .sort((a, b) => b.onePersonRate - a.onePersonRate),
    [],
  )
  const [selected, setSelected] = useState(ranked[0]?.code ?? sigungu[0].code)
  const [hovered, setHovered] = useState(null)
  const [metric, setMetric] = useState('onePersonRate')
  const [avgFilter, setAvgFilter] = useState(null)  // null | 'above' | 'below' (인천 평균 대비)

  const selectedRow = sigungu.find((r) => r.code === selected)
  const rank = ranked.findIndex((r) => r.code === selected) + 1
  const link = { selected, hovered, onSelect: setSelected, onHover: setHovered }
  const avgValue = summary[metric]

  return (
    <div className="shell">
      <Header summary={summary} />
      <div className="body">
        <ChoroplethMap rows={sigungu} {...link} metricKey={metric}
          avgFilter={avgFilter} avgValue={avgValue} />
        <Sidebar rows={sigungu} summary={summary} metricKey={metric} onMetric={setMetric}
          avgFilter={avgFilter} onAvgFilter={setAvgFilter} avgValue={avgValue}
          selected={selected} onSelect={setSelected} />
        <CenterPanel rows={sigungu} summary={summary} trend={trend} link={link}
          metricKey={metric} avgFilter={avgFilter} avgValue={avgValue}
          selectedRow={selectedRow} rank={rank} total={ranked.length} />
      </div>
    </div>
  )
}
