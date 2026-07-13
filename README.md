# 인천광역시 1인가구 · 세대구조 정책 대시보드

시군구 단위로 **1인가구 비율 · 연령구조 · 세대 구조**를 진단하고,
**청년형 / 고령형 / 균형형**으로 유형화해 정책 우선순위를 보여주는 대시보드.

## 📌 바로 보기 (설치 불필요)

**[`docs/index.html`](docs/index.html) 파일을 내려받아 더블클릭**하면 브라우저에서 바로 열립니다.
JS·CSS·데이터·경계가 모두 한 파일에 내장돼 있어 서버·설치가 필요 없습니다.
(지도 배경 타일만 인터넷 연결이 필요합니다.)

> GitHub Pages를 켜면 링크로도 공유됩니다 — Settings → Pages → Source: `main` / `docs`.

## 화면 구성

- **시군구 지도** — 실제 지도(Leaflet + CARTO) 위에 시군구 경계를 색으로 표시. 상단 버튼으로 지표(1인가구율·고령 1인·세대당 인구) 전환
- **핵심 진단 · 정책 시사점** — 데이터에서 자동 도출 (돌봄 취약·서비스 수요·청년 주거·소형가구화)
- **1인가구 연령구조 · 정책 유형** — 청년/중년/고령 분해 + 청년형·고령형·균형형 분류
- **정책 유형 사분면** — 인천 평균 기준선으로 '돌봄 우선구역' 식별
- **시군구 순위 · 평균 대비 · 세대 추이**

지도·순위·산점도·상세가 클릭·호버로 서로 연동됩니다.

## 데이터 출처 (전부 공개 파일)

| 데이터 | 출처 |
|---|---|
| 가구주의 연령 및 가구원수별 가구(일반가구)-시군구 (2023) | KOSIS 인구총조사 `DT_1JC1511` |
| 주민등록 인구·세대현황 (2025 월별) | 행정안전부 |
| 시군구 경계 | 국토지리정보원 연속수치지형도 행정경계(읍면동) `N3A_G0110000` |

## 개발 / 재빌드

```bash
# 1) 원본 데이터 → 정적 JSON/GeoJSON (GDAL 불필요)
python3 -m pip install -r scripts/requirements.txt
python3 scripts/extract.py

# 2-a) 개발 서버
npm install
npm run dev

# 2-b) 공유용 단일 HTML 생성 → dist/index.html
npm run build
#     dist/index.html 한 파일만 배포하면 됩니다 (docs/ 로 복사해 커밋)
```

`scripts/extract.py` 가 표 형식 원본을 정제·집계해 `src/data/*.json` 과
`src/data/incheonGeo.json`(경계) 을 만들고, React 앱이 이를 읽어 렌더링합니다.
`npm run build` 는 이 모든 것을 `dist/index.html` 하나로 인라인합니다.

## 스택

React + Vite · Recharts(차트) · React-Leaflet(지도) · vite-plugin-singlefile(단일 HTML)
