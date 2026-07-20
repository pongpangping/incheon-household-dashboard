import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LabelList, ReferenceLine, ReferenceArea,
} from 'recharts'
import { pct, comma } from '../lib/format.js'
import { pearson, linreg, corrLabel } from '../lib/stats.js'

export default function ScatterAgedOne({ rows, selected, hovered, onSelect, onHover, summary, bare }) {
  const data = rows
    .filter((r) => r.onePersonRate != null && r.agedOneShareOfOne != null)
    .map((r) => ({ x: r.onePersonRate, y: r.agedOneShareOfOne, z: r.onePerson, name: r.name, code: r.code }))

  // 프론트 실시간 계산: 상관계수 + 최소제곱 회귀선
  const xs = data.map((d) => d.x), ys = data.map((d) => d.y)
  const r = pearson(xs, ys)
  const fit = linreg(xs, ys)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const regSeg = fit ? [
    { x: xMin, y: fit.slope * xMin + fit.intercept },
    { x: xMax, y: fit.slope * xMax + fit.intercept },
  ] : null

  const ax = summary.onePersonRate         // 인천 평균 1인가구 비율
  const ay = summary.agedOneShareOfOne      // 인천 평균 고령 비중

  const fillFor = (code) => {
    if (code === selected) return '#FF8A00'
    if (code === hovered) return '#FFA94D'
    return 'rgba(255,138,0,0.5)'
  }

  return (
    <div className={bare ? 'chart-bare' : 'glass card'}>
      {!bare && <h2>1인가구 비율 × 고령 비중</h2>}
      <div className="card-sub">
        X 1인가구 비율 · Y 고령(65+) 비중 · 원 크기 1인가구 수 · 십자선 = 인천 평균
      </div>
      {r != null && (
        <div className="corr-badge">
          상관계수 <b>r = {r.toFixed(2)}</b> · {corrLabel(r)}
          <span className="corr-reg">회귀선 y = {fit.slope.toFixed(2)}x + {fit.intercept.toFixed(1)}</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={330}>
        <ScatterChart margin={{ left: 4, right: 18, top: 12, bottom: 16 }}>
          <CartesianGrid strokeDasharray="2 4" />
          <XAxis type="number" dataKey="x" name="1인가구 비율" unit="%"
            domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false}
            tick={{ fontSize: 10, fill: '#9aa0ac' }}
            label={{ value: '1인가구 비율(%) →', position: 'insideBottom', offset: -6,
              fill: '#8a909c', fontSize: 10 }} />
          <YAxis type="number" dataKey="y" name="고령 비중" unit="%"
            domain={['dataMin - 3', 'dataMax + 4']} tickLine={false} axisLine={false}
            tick={{ fontSize: 10, fill: '#9aa0ac' }}
            label={{ value: '고령 비중(%) →', angle: -90, position: 'insideLeft',
              fill: '#8a909c', fontSize: 10 }} />
          <ZAxis type="number" dataKey="z" range={[40, 260]} />
          <ReferenceLine x={ax} stroke="#CBD5E1" strokeDasharray="4 3"
            label={{ value: '평균', position: 'top', fill: '#94A3B8', fontSize: 9 }} />
          <ReferenceLine y={ay} stroke="#CBD5E1" strokeDasharray="4 3" />
          {regSeg && <ReferenceLine ifOverflow="extendDomain" stroke="#0B6BB0" strokeWidth={1.6}
            strokeDasharray="6 4" segment={regSeg}
            label={{ value: '회귀선', position: 'insideTopRight', fill: '#0B6BB0', fontSize: 9 }} />}
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
            <LabelList dataKey="name" position="top" fill="#4b515e" fontSize={9} offset={6} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
