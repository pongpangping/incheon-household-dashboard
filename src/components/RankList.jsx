import { metricBy } from '../lib/metrics.js'

const TYPE_COLOR = { '청년형': '#2a78d6', '고령형': '#eb6834', '균형형': '#8a909c' }
const SEQ = ['#cde2fb', '#9ec5f4', '#3987e5', '#1c5cab', '#0d366b']

export default function RankList({ rows, selected, hovered, onSelect, onHover, metricKey, typeFilter }) {
  const metric = metricBy(metricKey)
  const vals = rows.map((r) => r[metricKey]).filter((x) => x != null)
  const min = Math.min(...vals), max = Math.max(...vals)
  const color = (v) => (max === min ? '#cbd5e6' : SEQ[Math.round(((v - min) / (max - min)) * (SEQ.length - 1))])
  const list = [...rows].filter((r) => r[metricKey] != null).sort((a, b) => b[metricKey] - a[metricKey])

  return (
    <div className="rank-list">
      {list.map((r, i) => (
        <button key={r.code}
          className={`rank-row${r.code === selected ? ' on' : ''}${r.code === hovered ? ' hov' : ''}${typeFilter && r.oneType !== typeFilter ? ' dim' : ''}`}
          onClick={() => onSelect(r.code)}
          onMouseEnter={() => onHover?.(r.code)} onMouseLeave={() => onHover?.(null)}>
          <span className="rr-rank">{i + 1}</span>
          <span className="rr-dot" style={{ background: TYPE_COLOR[r.oneType] }} />
          <span className="rr-name">{r.name}</span>
          <span className="rr-bar"><i style={{
            width: `${((r[metricKey] - min) / (max - min || 1)) * 100}%`, background: color(r[metricKey]),
          }} /></span>
          <span className="rr-val">{metric.fmt(r[metricKey])}</span>
        </button>
      ))}
    </div>
  )
}
