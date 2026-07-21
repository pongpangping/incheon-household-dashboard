import { useMemo } from 'react'
import { kmeans } from '../lib/stats.js'
import { pct } from '../lib/format.js'

// 데이터 기반 유형화(k-means) — 3지표로 시군구를 유형으로 묶어 보여준다.
export default function ClusterCard({ rows, selected, onSelect }) {
  const res = useMemo(() => kmeans(rows, 3), [rows])
  if (!res) return null
  const selCl = res.byCode[selected]

  return (
    <div className="clusters">
      <div className="cl-note">1인가구율 · 고령 1인가구 비중 · 세대당 인구를 정규화해 묶은 결과 (k-means)</div>
      {res.clusters.map((c) => (
        <div className={`cl${c.id === selCl ? ' on' : ''}`} key={c.id} style={{ borderColor: c.id === selCl ? c.color : undefined }}>
          <div className="cl-head">
            <i style={{ background: c.color }} /><b>{c.name}</b><span>{c.members.length}개 시군구</span>
          </div>
          <div className="cl-mem">
            {c.members.map((m) => (
              <button key={m.code} className={m.code === selected ? 'sel' : ''} onClick={() => onSelect(m.code)}>{m.name}</button>
            ))}
          </div>
          <div className="cl-avg">평균 · 1인 {pct(c.avg.onePersonRate)} · 고령 {pct(c.avg.agedOneShareOfOne)} · 세대당 {c.avg.avgHouseholdSize.toFixed(2)}명</div>
        </div>
      ))}
    </div>
  )
}
