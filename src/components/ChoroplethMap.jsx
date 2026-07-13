import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { metricBy } from '../lib/metrics.js'
import { comma, pct } from '../lib/format.js'
import rawGeo from '../data/incheonGeo.json'

const SEQ = ['#E6F3FF', '#C7E6FF', '#9AD3FF', '#66BCFF', '#33A8FF', '#0B93EE', '#008AE0', '#006BB0']
const TYPE_COLOR = { '청년형': '#008AE0', '고령형': '#FF8A00', '균형형': '#94A3B8' }

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

export default function ChoroplethMap({ rows, selected, hovered, onSelect, onHover, metricKey, typeFilter }) {
  const geoRef = useRef(null)
  const [map, setMap] = useState(null)

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
  const styleFor = (f) => {
    const code = codeOf(f); const row = byCode[code]
    const isSel = code === selected, isHov = code === hovered
    const matches = !typeFilter || row?.oneType === typeFilter
    return {
      fillColor: fillFor(row?.[metric.key]),
      fillOpacity: !matches ? 0.12 : (selected && !isSel) || (hovered && !isHov) ? 0.6 : 0.92,
      color: isSel ? '#17181d' : isHov ? '#3a3f4a' : '#ffffff',
      weight: isSel ? 3 : isHov ? 2.2 : 1.2,
      opacity: !matches ? 0.4 : 1,
    }
  }
  const hoverCard = (row) => `
    <div class="mtip-h"><b>${row.name}</b>
      <span class="mtip-type" style="background:${TYPE_COLOR[row.oneType] || '#8a909c'}">${row.oneType || ''}</span></div>
    <div class="mtip-row"><span>${metric.label}</span><b>${metric.fmt(row[metric.key])}</b></div>
    <div class="mtip-row"><span>1인가구 비율</span><b>${pct(row.onePersonRate)}</b></div>
    <div class="mtip-row"><span>인구 / 세대</span><b>${comma(row.population)} / ${comma(row.households)}</b></div>`

  const onEachFeature = (feature, layer) => {
    const row = byCode[codeOf(feature)]
    if (row) layer.bindTooltip(hoverCard(row), { sticky: true, direction: 'top', opacity: 1, className: 'm-tooltip' })
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
    })
  })

  useEffect(() => {
    if (!map || !geoRef.current) return
    let target
    geoRef.current.eachLayer((l) => { if (codeOf(l.feature) === selected) target = l })
    if (target) map.flyToBounds(target.getBounds(), { maxZoom: 11, padding: [50, 50], duration: 0.7 })
  }, [selected, map])

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
        scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO' subdomains="abcd" maxZoom={19} />
        {geo && <GeoJSON ref={geoRef} data={geo} style={styleFor} onEachFeature={onEachFeature} />}
        <ZoomControl position="topright" />
      </MapContainer>

      <div className="maplegend">
        <h4>{metric.label}</h4>
        {buckets.map((b, i) => (
          <div className="ml-row" key={i}>
            <i style={{ background: b.color }} />
            {metric.fmt(Math.round(b.lo * 10) / 10)} ~ {metric.fmt(Math.round(b.hi * 10) / 10)}
          </div>
        ))}
      </div>
    </div>
  )
}
