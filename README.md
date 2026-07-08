# Task Board Assignment

SyncLife 프론트엔드 과제용 태스크 보드입니다.
느리고 가끔 실패하는 mock API 환경에서 5,000개 태스크를 안정적으로 조회, 이동, 생성, 수정, 삭제할 수 있도록 개선했습니다.

## 배포 / 저장소

- GitHub 저장소: https://github.com/mjpark-k/synclife-task-board
- 배포 URL: https://mjpark-k.github.io/synclife-task-board/

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 안내되는 로컬 주소로 접속합니다.

## 테스트 / 빌드

```bash
npm test
npm run build
```

## 사용 기술 스택

- React
- TypeScript
- Vite
- MSW
- Vitest
- @tanstack/react-virtual

## 구현 기능

### Priority 1

- 초기 데이터 조회 시 loading / error / retry 상태 처리
- 태스크가 없는 경우에도 보드와 생성 버튼을 유지하는 empty state 처리
- 태스크 이동 시 optimistic update 적용
- 이동 실패 시 이전 상태로 rollback
- 생성 / 수정 / 삭제 기능 구현
- 생성 / 수정 / 삭제 실패 시 rollback 처리
- 빠른 연속 이동 시 오래된 응답을 무시하는 race condition 처리
- `version`을 사용한 서버 충돌 감지 대응
- 409 충돌과 500 서버 오류 toast 메시지 구분
- 5,000개 태스크 렌더링 성능 개선을 위한 virtualization 적용
- 인라인 수정 폼처럼 카드 높이가 바뀌는 경우 `measureElement`로 실제 높이 재측정
- 제목 검색 기능
- 우선순위 필터 기능
- 필터 결과가 없는 컬럼의 empty state 표시
- 핵심 순수 로직 유닛 테스트 추가

### Priority 2 일부 구현

- 409 충돌 발생 시 일반 서버 오류와 구분되는 toast 메시지 표시
- 실패한 쓰기 요청은 자동 재시도하지 않고 rollback 후 사용자가 직접 다시 시도하도록 처리

## 미구현 기능 / 사유

다음 기능은 시간 제약과 우선순위를 고려해 구현하지 않았습니다.

- 409 충돌 시 서버 최신값과 내 변경값을 비교해 선택하는 충돌 해결 UI
- 실패한 쓰기 요청의 자동 재시도 / backoff
- 다중 탭 동기화
- 키보드만으로 카드 이동
- 검색 debounce
- 상태 / 태그 다중 필터
- 정량적인 Performance before/after 프로파일링

이번 과제에서는 Priority 1 요구사항과 실제 사용 중 체감되는 안정성, 5,000개 데이터 렌더링 성능 개선을 우선했습니다. 각 결정의 자세한 이유는 `DECISIONS.md`에 정리했습니다.

## 제출 전 체크리스트

- [ ] 배포 URL에서 구현 기능이 정상 동작
- [x] `WRITE_FAILURE_RATE`를 높여 롤백 동작을 확인한 뒤 기본값으로 복구
- [x] 카드를 빠르게 연속 이동해도 서버 상태와 일치
- [x] 5,000개에서 검색 / 드래그가 버벅이지 않음
- [x] 유닛 테스트 통과, Console 에러 없음
- [x] README / DECISIONS.md / AI_USAGE.md 작성 완료
- [x] 커밋 10개 이상

## 문서

- `DECISIONS.md`: 상태 구조, rollback, race condition, 성능, 트레이드오프 정리
- `AI_USAGE.md`: 사용한 AI 도구, 활용 방식, 검증 / 수정 / 거부한 내용 정리