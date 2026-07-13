import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { pct } from '../lib/format.js'

const SEG = [
  { key: 'youngOneShare', name: '청년(20~39)', color: '#2a78d6' },
  { key: 'midOneShare', name: '중년(40~64)', color: '#1baf7a' },
  { key: 'agedOneShareOfOne', name: '고령(65+)', color: '#eb6834' },
]
const TYPE_COLOR = { '청년형': '#2a78d6', '고령형': '#eb6834', '균형형': '#8a909c' }

export default function AgeStructure({ rows, selected, hovered, onSelect, onHover, typeFilter, bare }) {
  const data = [...rows]
    .filter((r) => r.agedOneShareOfOne != null)
    .sort((a, b) => b.agedOneShareOfOne - a.agedOneShareOfOne)
  const dim = (code) => {
    const r = data.find((x) => x.code === code)
    if (typeFilter && r?.oneType !== typeFilter) return true
    return (selected && code !== selected) || (hovered && code !== hovered)
  }

  const TypeTag = ({ x, y, width, height, index }) => {
    const t = data[index]?.oneType
    if (!t) return null
    return (
      <text x={x + width + 8} y={y + height / 2} dy={4}
        fill={TYPE_COLOR[t]} fontSize={11.5} fontWeight={700}>{t}</text>
    )
  }

  return (
    <div className={bare ? 'chart-bare' : 'glass card'}>
      {!bare && <h2>1인가구 연령구조 · 정책 유형</h2>}
      <div className="card-sub">
        시군구별 1인가구를 연령대로 분해 (KOSIS 2023) · 고령 비중 높은 순 · 클릭하면 지도 이동
      </div>
      <div className="type-legend">
        {SEG.map((s) => (<span key={s.key}><i style={{ background: s.color }} />{s.name}</span>))}
      </div>
      <ResponsiveContainer width="100%" height={332}>
        <BarChart data={data} layout="vertical" stackOffset="expand"
          margin={{ left: 8, right: 62, top: 4, bottom: 4 }} barCategoryGap={5}>
          <XAxis type="number" hide domain={[0, 1]} />
          <YAxis type="category" dataKey="name" width={62} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'rgba(20,30,60,0.05)' }}
            formatter={(v, n, p) => [pct(p.payload[SEG.find((s) => s.name === n).key]), n]} />
          {SEG.map((s, si) => (
            <Bar key={s.key} dataKey={s.key} stackId="a" name={s.name}
              isAnimationActive={false} cursor="pointer"
              onClick={(d) => onSelect(d.code)}
              onMouseEnter={(d) => onHover?.(d.code)} onMouseLeave={() => onHover?.(null)}>
              {data.map((d) => (
                <Cell key={d.code} fill={s.color}
                  fillOpacity={dim(d.code) ? 0.4 : 1}
                  stroke={d.code === selected ? '#16181d' : '#fff'}
                  strokeWidth={d.code === selected ? 1.4 : 0.6} />
              ))}
              {si === SEG.length - 1 && <LabelList content={TypeTag} />}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
