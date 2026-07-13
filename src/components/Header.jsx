import { pct } from '../lib/format.js'

export default function Header({ summary }) {
  return (
    <header className="header">
      <div className="hd-left">
        <div className="hd-logo">인천</div>
        <div className="hd-title">
          인천광역시 1인가구 · 세대구조
          <small>자료 : KOSIS 인구총조사(2023) · 행정안전부 주민등록(2025)</small>
        </div>
      </div>
      <div className="hd-right">
        <div className="hd-chips">
          <span className="hd-chip">1인가구<b>{pct(summary.onePersonRate)}</b></span>
          <span className="hd-chip">세대당 인구<b>{summary.avgHouseholdSize}명</b></span>
          <span className="hd-chip">고령 1인가구<b>{pct(summary.agedOneShareOfOne)}</b></span>
        </div>
      </div>
    </header>
  )
}
