# Is my Pods Worth It?

> AirPods 모델별 청취 통계 도구 · Apple 건강 데이터 내보내기를 100% 로컬에서 오프라인 분석

[繁體中文（香港）](README.zh-HK.md) | [繁體中文（台灣）](README.zh-TW.md) | [简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md) | **한국어**

🔗 **라이브 데모:** https://chanhong1024.github.io/is-my-pods-worth-it/

![Is my Pods Worth It?](og-image.png)

Apple의 "Liquid Glass" 글래스모피즘 UI로 만든 순수 프런트엔드 정적 사이트입니다. iPhone "건강" 앱에서 내보낸 `export.zip`(또는 `export.xml`)을 끌어다 놓으면 자동으로:

- 각 `HeadphoneAudioExposure`(헤드폰 볼륨) 기록에서 하드웨어 모델 ID와 기기 이름을 추출
- 모델별로 그룹화하여 계산:
  - 총 청취 시간
  - 시간 가중 평균 볼륨
  - 최고 기록 볼륨
  - 사용 기간
  - 샘플 기록 수
  - **권장 소비자 가격(RRP)**
  - **시간당 청취 비용**
  - **가성비 점수(0–100)**

## 기능

- 🔒 **100% 로컬**: 모든 분석이 브라우저에서 이루어지며 데이터는 **절대 업로드되지 않고** 오프라인에서도 작동
- 🎧 **모델별 인식**: Apple 헤드폰 모델 대응표 내장(AirPods 1/2/3/4/5, AirPods Pro 1/2/3, AirPods Max 1/2). AirPods Pro 세대(Lightning/USB-C)도 구분하며 **Sony XM 시리즈**(WH-1000XM 오버이어, WF-1000XM 완전 무선)도 지원
- 🔢 **hex 모델 ID 지원**: 일부 iOS 버전은 Apple Bluetooth Product ID로 표시되므로(예: `0x200E`＝AirPods Pro 1, `0x2014`＝AirPods Pro 2) 대응표를 내장. 유선 EarPods도 자동 표시
- 🌐 **6개 언어**: 번체 중국어(홍콩/대만), 간체 중국어, English, 日本語, 한국어를 원클릭으로 전환. 브라우저 언어 자동 감지
- 🧊 **Liquid Glass UI**: Tailwind CSS + 글래스모피즘(backdrop-blur, 스페큘러 하이라이트)
- 💰 **가성비 점수**: 권장 소비자 가격(HK$, 참고값·수정 가능)을 내장하고 "시간당 청취 비용"을 0–100점으로 환산. 높을수록 가성비가 좋음
- 📊 **기기 대시보드**: 카드를 탭하면 공유 가능한 독립 상세 페이지(뒤로가기 + 공유 URL)가 열립니다. KPI, 일별/주별/월별 사용량 그래프(볼륨 추세선 포함), 캘린더 히트맵, 요일별 분포, 월간 합계, **Chronodex 24시간 시간대 다이얼**, `7일/30일/90일/1년/전체` + 사용자 지정 기간 필터
- 📤 **원탭 공유 이미지**: 설정 팝업에서 비율(4:5／1:1／9:16), 다크/라이트, 정렬, 포함할 기기, 사용자 지정 제목, 시간당 비용 표시 여부를 선택. 실시간 미리보기 후 Threads/IG로 공유하거나 PNG 다운로드(순수 Canvas)
- 📱 **반응형**: 모바일 1열, 데스크톱 다열
- ⚡ **스트리밍 파서**: 큰 파일을 청크 단위로 처리하므로 UI가 멈추지 않음

## 지원 언어

| 언어 | 코드 |
| --- | --- |
| 번체 중국어(홍콩) | `zh-HK` |
| 번체 중국어(대만) | `zh-TW` |
| 간체 중국어 | `zh-CN` |
| English | `en` |
| 日本語 | `ja` |
| 한국어 | `ko` |

오른쪽 상단 드롭다운에서 언제든 전환할 수 있으며 선택은 기억됩니다. 첫 방문 시 브라우저 언어를 자동 감지합니다.

## 지원 기기

- **Apple**
  - AirPods(1~5세대, ANC 및 무선 충전 모델 포함)
  - AirPods Pro(1~3세대, Lightning 및 USB-C)
  - AirPods Max(1세대 Lightning/USB-C, Max 2)
  - EarPods(유선)
- **Sony**
  - WH-1000XM3 / XM4 / XM5 / XM6(오버이어)
  - WF-1000XM3 / XM4 / XM5(완전 무선)
- 알 수 없거나 기타 Bluetooth/유선 기기는 자동으로 그룹화되어 표시됩니다.

## 사용 방법

1. iPhone에서 **"건강"** 앱 열기 → 오른쪽 상단 프로필 사진 → **모든 건강 데이터 내보내기**
2. 내보낸 `export.zip`을 사이트로 끌어다 놓기(또는 `export.xml` 선택)
3. 모델별 통계를 즉시 확인

> 단계를 잊었다면 업로드 영역 오른쪽 상단의 **?** 버튼을 탭하세요. 선택한 언어로 단계별 안내가 표시됩니다.

## 프로젝트 구조

| 파일 | 역할 |
| --- | --- |
| `index.html` | HTML 마크업만 |
| `styles.css` | 사용자 지정 스타일(글래스 UI, 차트, 애니메이션) |
| `app.js` | 파싱, i18n, 차트, 공유 이미지 |
| `devices.js` | **지원 기기 정보**: 모델명＋권장 가격. 모델 추가나 가격 변경은 이 파일 |

기기를 추가하려면 `devices.js`를 열고 Apple은 `MODEL_MAP`과 `PRICE_APPLE`, Sony는 `PRICE_SONY`에 한 줄씩 추가하세요. 번체(대만/중국), 일본어, 한국어 이름은 `zh-HK`／`en`에서 자동 생성됩니다.

## 기술 스택

- [Tailwind CSS](https://tailwindcss.com/)(Play CDN, 빌드 불필요)
- [fflate](https://github.com/101arrowz/fflate)(ZIP 압축 해제)
- Google Fonts — Noto Sans TC / SC / JP / KR
- 순수 HTML + Vanilla JS, 백엔드 없음

## GitHub Pages 배포

1. 이 repo를 GitHub에 push
2. **Settings → Pages**로 이동
3. "Build and deployment"에서:
   - **Source**: `Deploy from a branch`
   - **Branch**: `master`／`(root)`
4. 저장하면 몇 분 안에 `https://<username>.github.io/is-my-pods-worth-it/`가 공개됩니다

## 로컬 미리보기

`index.html`을 직접 열면 됩니다(`fflate`와 Tailwind는 CDN에서 한 번 불러오므로 인터넷 연결 필요, 이후 분석은 완전히 오프라인).
