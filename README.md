# 차폐실 학습 시뮬레이터

React 19.2 + Vite 7 + Tailwind v4 기반의 학생용 차폐실 제작 시뮬레이터입니다.

## 실행

```bash
npm install
npm run dev
```

## 현재 구현 범위

- 메인 화면 버튼 3개
- 2번 버튼으로 진입하는 단계형 차폐실 시뮬레이터
- 벽체, 개구부, 관통판, 문 조인트, 본딩 단계별 선택
- 정면도 / 후면도 제작 공간 미리보기
- 마지막 단계 결과 패널과 학습 점수
- JSON 내보내기 / 불러오기

## 테스트

```bash
npm run test:run
```

Playwright 스캐폴드:

```bash
npm run test:e2e
```
