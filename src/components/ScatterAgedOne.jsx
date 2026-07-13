import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LabelList, ReferenceLine, ReferenceArea,
} from 'recharts'
import { pct, comma } from '../lib/format.js'

export default function ScatterAgedOne({ rows, selected, hovered, onSelect, onHover, summary, bare }) {
  const data = rows
    .filter((r) => r.onePersonRate != null && r.agedOneShareOfOne != null)
    .map((r) => ({ x: r.onePersonRate, y: r.agedOneShareOfOne, z: r.onePerson, name: r.name, code: r.code }))

  const ax = summary.onePersonRate         // 인천 평균 1인가구 비율
  const ay = summary.agedOneShareOfOne      // 인천 평균 고령 비중

  const fillFor = (code) => {
    if (code === selected) return '#FF8A00'
    if (code === hovered) return '#FFA94D'
    return 'rgba(255,138,0,0.5)'
  }

  return (
    <div className={bare ? 'chart-bare' : 'glass card'}>
      {!bare && <h2>정책 유형 사분면 · 고령 1인가구</h2>}
      <div className="card-sub">
        X 1인가구 비율 · Y 고령(65+) 비중 · 원 크기 1인가구 수 · 십자선 = 인천 평균 · 우상단일수록 돌봄 우선
      </div>
      <ResponsiveContainer width="100%" height={330}>
        <ScatterChart margin={{ left: 6, right: 22, top: 14, bottom: 18 }}>
          <CartesianGrid strokeDasharray="2 4" />
          <XAxis type="number" dataKey="x" name="1인가구 비율" unit="%"
            domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false}
            label={{ value: '1인가구 비율(%) →', position: 'insideBottom', offset: -8,
              fill: '#8a909c', fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name="고령 비중" unit="%"
            domain={['dataMin - 3', 'dataMax + 4']} tickLine={false} axisLine={false}
            label={{ value: '고령 비중(%) →', angle: -90, position: 'insideLeft',
              fill: '#8a909c', fontSize: 11 }} />
          <ZAxis type="number" dataKey="z" range={[90, 620]} />
          <ReferenceLine x={ax} stroke="#b7bdc9" strokeDasharray="4 3" />
          <ReferenceLine y={ay} stroke="#b7bdc9" strokeDasharray="4 3" />
          <ReferenceArea x1={ax} y1={ay} x2={999} y2={999} fill="#FF8A00" fillOpacity={0.07}
            label={{ value: '돌봄 우선(고령·1인 동반↑)', position: 'insideTopRight',
              fill: '#C2410C', fontSize: 10.5, fontWeight: 600 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(20,30,60,0.25)' }}
            formatter={(v, n) => n === '1인가구 수' ? comma(v) : pct(v)} />
          <Scatter data={data} isAnimationActive={false}
            onClick={(d) => onSelect(d.code)}
            onMouseEnter={(d) => onHover?.(d.code)} onMouseLeave={() => onHover?.(null)}>
            {data.map((d) => (
              <Cell key={d.code} fill={fillFor(d.code)}
                stroke={d.code === selected ? '#B45309' : 'rgba(255,255,255,0.9)'}
                strokeWidth={d.code === selected ? 2 : 1} cursor="pointer" />
            ))}
            <LabelList dataKey="name" position="top" fill="#4b515e" fontSize={11} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
