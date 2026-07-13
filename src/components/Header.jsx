import { pct } from '../lib/format.js'

export default function Header({ summary }) {
  return (
    <header className="header">
      <div className="hd-left">
        <div className="hd-logo">仁</div>
        <div className="hd-title">
          인천 1인가구 · 세대구조 대시보드
          <small>시군구 정책 지원 · KOSIS 2023 · 주민등록 2025</small>
        </div>
      </div>
      <div className="hd-right">
        <div className="hd-chips">
          <span className="hd-chip">1인가구<b>{pct(summary.onePersonRate)}</b></span>
          <span className="hd-chip">세대당<b>{summary.avgHouseholdSize}명</b></span>
          <span className="hd-chip">고령 1인<b>{pct(summary.agedOneShareOfOne)}</b></span>
        </div>
        <div className="hd-badge">인천광역시</div>
      </div>
    </header>
  )
}
