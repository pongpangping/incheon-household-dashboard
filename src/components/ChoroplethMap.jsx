import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { metricBy } from '../lib/metrics.js'
import { comma, pct } from '../lib/format.js'
import rawGeo from '../data/incheonGeo.json'
import rawGrid from '../data/incheonGrid.json'

const SEQ = ['#E6F3FF', '#C7E6FF', '#9AD3FF', '#66BCFF', '#33A8FF', '#0B93EE', '#008AE0', '#006BB0']
// 격자 밀집도 — 따뜻한 계열(단계구분도 파랑과 구분)
const HEAT = ['#FFF0D4', '#FFD9A0', '#FFB866', '#FF9433', '#F5760D', '#D65A00', '#A63F00']
const GRID_ZOOM = 11  // 이 줌 이상에서 격자 표시(구 확대 시)

const okRing = (r) =>
  Array.isArray(r) && r.length >= 4 &&
  r.every((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
function cleanGeometry(g) {
  if (!g) return null
  if (g.type === 'Polygon') {
    const rings = (g.coordinates || []).filter(okRing)
    return rings.length ? { type: 'Polygon', coordinates: rings } : null
  }
  if (g.type === 'MultiPolygon') {
    const polys = (g.coordinates || []).map((p) => (p || []).filter(okRing)).filter((p) => p.length)
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null
  }
  return null
}
const codeOf = (f) =>
  String(f.properties?.SIG_CD ?? f.properties?.sig_cd ?? f.properties?.code ?? '').slice(0, 5)

export default function ChoroplethMap({ rows, selected, hovered, onSelect, onHover, metricKey, avgFilter, avgValue, showGrid }) {
  const geoRef = useRef(null)
  const [map, setMap] = useState(null)
  const [zoom, setZoom] = useState(10)

  const { geo, status } = useMemo(() => {
    const features = ((rawGeo && rawGeo.features) || [])
      .map((f) => ({ ...f, geometry: cleanGeometry(f.geometry) }))
      .filter((f) => f.geometry)
    return features.length
      ? { geo: { type: 'FeatureCollection', features }, status: 'ok' }
      : { geo: null, status: 'missing' }
  }, [])

  const metric = metricBy(metricKey)
  const byCode = useMemo(() => Object.fromEntries(rows.map((r) => [r.code, r])), [rows])
  const [min, max] = useMemo(() => {
    const v = rows.map((r) => r[metric.key]).filter((x) => x != null)
    return [Math.min(...v), Math.max(...v)]
  }, [rows, metric.key])

  const fillFor = (v) => {
    if (v == null || max === min) return 'rgba(20,30,60,0.10)'
    const t = Math.max(0, Math.min(1, (v - min) / (max - min)))
    return SEQ[Math.round(t * (SEQ.length - 1))]
  }
  const matchAvg = (row) => {
    if (!avgFilter || row?.[metric.key] == null) return true
    return avgFilter === 'above' ? row[metric.key] >= avgValue : row[metric.key] < avgValue
  }

  // ── 격자 밀집도 ──
  const gridActive = showGrid && zoom >= GRID_ZOOM
  const gridGeo = useMemo(() => ({
    type: 'FeatureCollection',
    features: (rawGrid.cells || []).map((c) => ({ type: 'Feature', properties: { v: c.v }, geometry: c.geometry })),
  }), [])
  const gridMax = useMemo(() => {
    const vs = (rawGrid.cells || []).map((c) => c.v)
    // 상위값이 색을 다 먹지 않도록 95퍼센타일 기준
    if (!vs.length) return 1
    const s = [...vs].sort((a, b) => a - b)
    return s[Math.floor(s.length * 0.95)] || s[s.length - 1]
  }, [])
  const gridColor = (v) => {
    const t = Math.max(0, Math.min(1, v / gridMax))
    return HEAT[Math.min(HEAT.length - 1, Math.round(t * (HEAT.length - 1)))]
  }
  const gridStyle = (f) => ({
    fillColor: gridColor(f.properties.v), fillOpacity: 0.72, stroke: false,
  })

  const styleFor = (f) => {
    const code = codeOf(f); const row = byCode[code]
    const isSel = code === selected, isHov = code === hovered
    const matches = matchAvg(row)
    // 격자가 켜지면 시군구는 채움을 거의 없애고 외곽선만 남김
    const baseFill = !matches ? 0.12 : (selected && !isSel) || (hovered && !isHov) ? 0.6 : 0.92
    return {
      fillColor: fillFor(row?.[metric.key]),
      fillOpacity: gridActive ? (isSel ? 0.04 : 0.0) : baseFill,
      color: isSel ? '#0F172A' : isHov ? '#334155' : gridActive ? '#94A3B8' : '#ffffff',
      weight: isSel ? 3 : isHov ? 2.2 : gridActive ? 1.6 : 1.2,
      opacity: !matches && !gridActive ? 0.4 : 1,
    }
  }
  const hoverCard = (row) => `
    <div class="mtip-h"><b>${row.name}</b></div>
    <div class="mtip-row"><span>${metric.label}</span><b>${metric.fmt(row[metric.key])}</b></div>
    <div class="mtip-row"><span>인구 / 세대</span><b>${comma(row.population)} / ${comma(row.households)}</b></div>`
  const popupCard = (row) => `
    <div class="mpop">
      <div class="mpop-h">${row.name}</div>
      <div class="mtip-row"><span>1인가구 비율</span><b>${pct(row.onePersonRate)}</b></div>
      <div class="mtip-row"><span>고령 1인가구 비중</span><b>${pct(row.agedOneShareOfOne)}</b></div>
      <div class="mtip-row"><span>세대당 인구</span><b>${row.avgHouseholdSize}명</b></div>
      <div class="mtip-row"><span>인구 / 세대</span><b>${comma(row.population)} / ${comma(row.households)}</b></div>
    </div>`

  const onEachFeature = (feature, layer) => {
    const row = byCode[codeOf(feature)]
    if (row) {
      layer.bindTooltip(hoverCard(row), { sticky: true, direction: 'top', opacity: 1, className: 'm-tooltip' })
      layer.bindPopup(popupCard(row), { closeButton: true, className: 'm-popup', offset: [0, -4] })
    }
    layer.on({
      click: () => onSelect(codeOf(feature)),
      mouseover: () => onHover?.(codeOf(feature)),
      mouseout: () => onHover?.(null),
    })
  }

  useEffect(() => {
    if (!geoRef.current) return
    geoRef.current.setStyle(styleFor)
    geoRef.current.eachLayer((l) => {
      const row = byCode[codeOf(l.feature)]
      if (row && l.getTooltip()) l.setTooltipContent(hoverCard(row))
      if (row && l.getPopup()) l.setPopupContent(popupCard(row))
    })
  })

  const firstRef = useRef(true)
  useEffect(() => {
    if (!map || !geoRef.current) return
    if (firstRef.current) {   // 초기: 인천 전체 개요 (범례 표시)
      firstRef.current = false
      try { map.fitBounds(geoRef.current.getBounds(), { padding: [30, 30] }) } catch (e) { /* noop */ }
      return
    }
    let target
    geoRef.current.eachLayer((l) => { if (codeOf(l.feature) === selected) target = l })
    if (target) {
      map.flyToBounds(target.getBounds(), { maxZoom: 12, padding: [40, 40], duration: 0.7 })
      target.openPopup()
    }
  }, [selected, map])

  // 줌 레벨 추적 → 범례는 축소(개요) 상태에서만 표시
  useEffect(() => {
    if (!map) return
    const onZoom = () => setZoom(map.getZoom())
    map.on('zoomend', onZoom); setZoom(map.getZoom())
    return () => map.off('zoomend', onZoom)
  }, [map])
  const showLegend = zoom <= 10

  // 범례 버킷 (연속 → 5구간)
  const buckets = useMemo(() => {
    if (max === min) return []
    const steps = [0, 0.2, 0.4, 0.6, 0.8, 1]
    return steps.slice(0, -1).map((s, i) => {
      const lo = min + (max - min) * s
      const hi = min + (max - min) * steps[i + 1]
      return { color: SEQ[Math.round(((s + steps[i + 1]) / 2) * (SEQ.length - 1))], lo, hi }
    })
  }, [min, max])

  if (status === 'missing') {
    return (
      <div className="map-canvas map-empty">
        <div>🗺️ 경계 데이터가 없습니다 — <code>python scripts/extract.py</code> 후 빌드하세요.</div>
      </div>
    )
  }

  return (
    <div className="map-canvas">
      <MapContainer ref={setMap} center={[37.45, 126.55]} zoom={10} zoomControl={false}
        preferCanvas={true} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO' subdomains="abcd" maxZoom={19} />
        {geo && <GeoJSON ref={geoRef} data={geo} style={styleFor} onEachFeature={onEachFeature} />}
        {gridActive && (
          <GeoJSON key="grid" data={gridGeo} style={gridStyle} interactive={false} />
        )}
        <ZoomControl position="topright" />
      </MapContainer>

      {showLegend && !gridActive && (
        <div className="maplegend">
          <h4>{metric.label}</h4>
          {buckets.map((b, i) => (
            <div className="ml-row" key={i}>
              <i style={{ background: b.color }} />
              {metric.fmt(Math.round(b.lo * 10) / 10)} ~ {metric.fmt(Math.round(b.hi * 10) / 10)}
            </div>
          ))}
        </div>
      )}

      {gridActive && (
        <div className="maplegend">
          <h4>1인가구 밀도 (500m 격자){rawGrid.sample ? ' · 표본' : ''}</h4>
          <div className="ml-scale">
            {HEAT.map((c, i) => <i key={i} style={{ background: c }} />)}
          </div>
          <div className="ml-ends"><span>낮음</span><span>높음</span></div>
          <div className="ml-note">셀당 {rawGrid.sample ? '추정 ' : ''}1인가구 수</div>
        </div>
      )}
    </div>
  )
}
