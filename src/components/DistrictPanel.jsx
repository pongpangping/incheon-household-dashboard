import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { comma, pct } from '../lib/format.js'

const DONUT = ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7'] // 1인/2인/3인/4인+

function CompareRow({ label, v, avg, unit }) {
  if (v == null || avg == null) return null
  const max = Math.max(v, avg) * 1.15
  const diff = v - avg
  const sign = diff > 0 ? '+' : ''
  const col = diff > 0 ? '#c0392b' : '#1c7c4a'
  return (
    <div className="cmp">
      <div className="cmp-top">
        <span className="cmp-label">{label}</span>
        <span className="cmp-val">{unit === '%' ? pct(v) : `${v}${unit}`}
          <span className="cmp-diff" style={{ color: col }}>
            ({sign}{unit === '%' ? `${diff.toFixed(1)}p` : diff.toFixed(2)})</span>
        </span>
      </div>
      <div className="cmp-track">
        <div className="cmp-avg" style={{ left: `${(avg / max) * 100}%` }} title="인천 평균" />
        <div className="cmp-bar" style={{ width: `${(v / max) * 100}%` }} />
      </div>
    </div>
  )
}

export default function DistrictPanel({ row, rank, total, summary }) {
  if (!row) return null
  const donut = [
    { name: '1인', value: row.onePerson },
    { name: '2인', value: row.twoPerson },
    { name: '3인', value: row.threePerson },
    { name: '4인+', value: row.fourPlusPerson },
  ].filter((d) => d.value != null)

  const stats = [
    { k: '인구 (2025)', v: `${comma(row.population)}명` },
    { k: '세대수 (2025)', v: `${comma(row.households)}세대` },
  ]

  return (
    <>
      <div className="panel-head">
        <span className="name">{row.name}</span>
        {row.oneType && (
          <span className="type-tag" style={{
            background: { '청년형': '#2a78d6', '고령형': '#eb6834', '균형형': '#8a909c' }[row.oneType],
          }}>{row.oneType}</span>
        )}
        <span className="rank">1인가구 비율 인천 {rank}위 / {total}</span>
      </div>
      <div className="card-sub">가구원수별 구성 (KOSIS 인구총조사, 2023)</div>

      <div className="donut-wrap">
        <ResponsiveContainer width={158} height={158}>
          <PieChart>
            <Pie data={donut} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72}
              startAngle={90} endAngle={-270} stroke="#ffffff" strokeWidth={2}
              isAnimationActive={true} animationDuration={400}>
              {donut.map((d, i) => <Cell key={d.name} fill={DONUT[i]} />)}
            </Pie>
            <text x="50%" y="46%" textAnchor="middle" className="donut-center-val">
              {pct(row.onePersonRate)}
            </text>
            <text x="50%" y="59%" textAnchor="middle" className="donut-center">1인가구</text>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          <div className="chips">
            {donut.map((d, i) => (
              <span className="chip" key={d.name}>
                <span style={{ color: DONUT[i], fontWeight: 700 }}>●</span>{' '}
                {d.name} <b>{comma(d.value)}</b>
              </span>
            ))}
          </div>
          <div className="stat-list2">
            {stats.map((s) => (
              <div className="stat" key={s.k}>
                <div className="k">{s.k}</div>
                <div className="v">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="agemini-title">1인가구 연령구성</div>
      <div className="agemini">
        <span className="am-seg" style={{ width: `${row.youngOneShare}%`, background: '#2a78d6' }} />
        <span className="am-seg" style={{ width: `${row.midOneShare}%`, background: '#1baf7a' }} />
        <span className="am-seg" style={{ width: `${row.agedOneShareOfOne}%`, background: '#eb6834' }} />
      </div>
      <div className="agemini-legend">
        <span><i style={{ background: '#2a78d6' }} />청년 {pct(row.youngOneShare)}</span>
        <span><i style={{ background: '#1baf7a' }} />중년 {pct(row.midOneShare)}</span>
        <span><i style={{ background: '#eb6834' }} />고령 {pct(row.agedOneShareOfOne)}</span>
      </div>

      <div className="cmp-title">인천 평균 대비 <span>(막대 위 선 = 인천 평균)</span></div>
      <div className="cmp-list">
        <CompareRow label="1인가구 비율" v={row.onePersonRate} avg={summary.onePersonRate} unit="%" />
        <CompareRow label="고령 1인가구 비중" v={row.agedOneShareOfOne} avg={summary.agedOneShareOfOne} unit="%" />
        <CompareRow label="세대당 인구" v={row.avgHouseholdSize} avg={summary.avgHouseholdSize} unit="명" />
      </div>
    </>
  )
}
