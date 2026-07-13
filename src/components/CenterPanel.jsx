import DistrictPanel from './DistrictPanel.jsx'
import RankList from './RankList.jsx'
import AgeStructure from './AgeStructure.jsx'
import ScatterAgedOne from './ScatterAgedOne.jsx'
import TrendChart from './TrendChart.jsx'
import { metricBy } from '../lib/metrics.js'

function Card({ n, title, children }) {
  return (
    <div className="ccard">
      <div className="ccard-head">
        <div className="ccard-num">{n}</div>
        <div className="ccard-title">{title}</div>
      </div>
      {children}
    </div>
  )
}

export default function CenterPanel({ rows, summary, trend, link, metricKey, avgFilter, avgValue, selectedRow, rank, total }) {
  const metric = metricBy(metricKey)
  const filterLabel = avgFilter === 'above' ? '평균 이상' : avgFilter === 'below' ? '평균 미만' : null
  return (
    <div className="center">
      <div className="breadcrumb">
        선택 지역<b>{selectedRow?.name ?? '—'}</b> · 지표<b>{metric.label}</b>
        {filterLabel && <> · 필터<b>{filterLabel}</b></>}
      </div>

      <Card n="1" title="선택 시군구 상세">
        <DistrictPanel row={selectedRow} rank={rank} total={total} summary={summary} />
      </Card>

      <Card n="2" title={`시군구 순위 · ${metric.label}`}>
        <RankList rows={rows} {...link} metricKey={metricKey} avgFilter={avgFilter} avgValue={avgValue} />
      </Card>

      <Card n="3" title="1인가구 연령대 구성">
        <AgeStructure rows={rows} {...link} bare />
      </Card>

      <Card n="4" title="1인가구 비율 × 고령 비중">
        <ScatterAgedOne rows={rows} {...link} summary={summary} bare />
      </Card>

      <Card n="5" title="세대수 · 세대당 인구 추이">
        <TrendChart trend={trend} bare />
      </Card>
    </div>
  )
}
