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
  const [typeFilter, setTypeFilter] = useState(null)

  const selectedRow = sigungu.find((r) => r.code === selected)
  const rank = ranked.findIndex((r) => r.code === selected) + 1
  const link = { selected, hovered, onSelect: setSelected, onHover: setHovered }

  return (
    <div className="shell">
      <Header summary={summary} />
      <div className="body">
        <ChoroplethMap rows={sigungu} {...link} metricKey={metric} typeFilter={typeFilter} />
        <Sidebar rows={sigungu} summary={summary} metricKey={metric} onMetric={setMetric}
          typeFilter={typeFilter} onTypeFilter={setTypeFilter} />
        <CenterPanel rows={sigungu} summary={summary} trend={trend} link={link}
          metricKey={metric} typeFilter={typeFilter}
          selectedRow={selectedRow} rank={rank} total={ranked.length} />
      </div>
    </div>
  )
}
