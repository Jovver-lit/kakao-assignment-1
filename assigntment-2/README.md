# Todo App — React 마이그레이션

Vanilla JS로 구현한 Todo 앱을 React(Vite) 기반으로 마이그레이션한 프로젝트입니다.


---

## 현재 구현된 기능

- Todo CRUD (추가 / 완료 토글 / 인라인 수정 / 삭제)
- 상태 필터 탭 (전체 / 진행 중 / 완료)
- 주간 뷰 (월~일 날짜 셀, 이전/다음 주 이동, Todo 개수 뱃지)
- 날짜 네비게이터 (하루 단위 이전/다음 이동)
- localStorage 영속성

---

## 파일 트리

```
assigmntment-2/
├── index.html                        # Vite 진입점 HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                      # React 루트 마운트
    ├── App.jsx                       # 루트 컴포넌트 — 전체 상태 관리
    ├── index.css                     # 전역 스타일 (기존 style.css 이식)
    │
    ├── components/
    │   ├── todo/
    │   │   ├── TodoInput.jsx         # 할일 입력 폼
    │   │   ├── TodoItem.jsx          # 단일 Todo 항목 (수정/삭제/토글)
    │   │   ├── TodoList.jsx          # Todo 목록 렌더링 + 빈 상태
    │   │   └── FilterTabs.jsx        # 전체/진행 중/완료 필터 탭
    │   └── view/
    │       └── WeekView.jsx          # 주간 뷰 (월~일 셀)
    │
    ├── hooks/
    │   ├── useLocalStorage.js        # localStorage 읽기/쓰기 훅
    │   └── useTodos.js               # Todo CRUD 로직 훅
    │
    └── utils/
        └── dateUtils.js              # 날짜 관련 순수 함수 모음
```

---

## 컴포넌트

### `App.jsx`

전체 앱의 루트 컴포넌트입니다. 모든 공유 상태를 여기서 관리하고 하위 컴포넌트로 props/콜백을 내려보냅니다.

| 상태 | 설명 |
|------|------|
| `selectedDate` | 현재 선택된 날짜 (Date 객체) |
| `currentFilter` | 현재 필터 값 `'all'` \| `'active'` \| `'done'` |

| 함수 | 설명 |
|------|------|
| `handleDateChange(newDate)` | 날짜 변경 시 `selectedDate` 갱신 + `currentFilter` 초기화 |
| `handleAddTodo(text)` | `useTodos.addTodo` 호출, 완료 필터 중이면 전체로 전환 |
| `handleFilterChange(filter)` | `currentFilter` 갱신 |
| `getFilteredTodoList()` | `selectedDate` + `currentFilter` 기준으로 todoList 필터링 |

---

### `components/todo/TodoInput.jsx`

할일 텍스트 입력 + 추가 버튼 + 유효성 에러 메시지를 담당합니다.

| props | 타입 | 설명 |
|-------|------|------|
| `onAdd` | `Function` | 유효한 텍스트 입력 시 호출 `(text) => void` |

| 상태 | 설명 |
|------|------|
| `inputText` | 입력창 현재 값 |
| `isError` | 에러 메시지 표시 여부 |

| 함수 | 설명 |
|------|------|
| `handleAdd()` | 빈 값이면 에러 표시, 유효하면 `onAdd(text)` 호출 후 초기화 |
| `handleKeyDown(e)` | Enter 키 입력 시 `handleAdd()` 호출 |
| `handleChange(e)` | 입력값 변경 시 에러 상태 해제 |

---

### `components/todo/TodoItem.jsx`

단일 Todo 항목을 렌더링합니다. 완료 토글, 인라인 편집, 삭제를 담당합니다.

| props | 타입 | 설명 |
|-------|------|------|
| `todo` | `Object` | `{ id, text, isDone, date }` |
| `onToggle` | `Function` | 완료 토글 콜백 `(id) => void` |
| `onDelete` | `Function` | 삭제 콜백 `(id) => void` |
| `onUpdate` | `Function` | 수정 저장 콜백 `(id, newText) => void` |

| 상태 | 설명 |
|------|------|
| `isEditing` | 편집 모드 여부 |
| `editText` | 편집 중인 텍스트 값 |

| 함수 | 설명 |
|------|------|
| `handleStartEdit()` | 편집 모드 진입, `editText`를 현재 텍스트로 초기화 |
| `handleSaveEdit()` | 빈 값이면 포커스 유지, 유효하면 `onUpdate` 호출 후 편집 모드 종료 |
| `handleCancelEdit()` | 편집 모드 취소, `editText` 원래 값으로 복원 |
| `handleEditKeyDown(e)` | Enter → 저장, Escape → 취소 |

---

### `components/todo/TodoList.jsx`

필터링된 Todo 배열을 받아 목록 또는 빈 상태 메시지를 렌더링합니다.

| props | 타입 | 설명 |
|-------|------|------|
| `filteredList` | `Array` | 이미 필터링된 Todo 배열 |
| `currentFilter` | `string` | 현재 필터 값 (빈 메시지 문구 결정에 사용) |
| `isTodaySelected` | `boolean` | 선택 날짜가 오늘인지 여부 (빈 메시지 문구 결정에 사용) |
| `onToggle` | `Function` | TodoItem으로 전달되는 토글 콜백 |
| `onDelete` | `Function` | TodoItem으로 전달되는 삭제 콜백 |
| `onUpdate` | `Function` | TodoItem으로 전달되는 수정 콜백 |

| 함수 | 설명 |
|------|------|
| `getEmptyMessage()` | `currentFilter`와 `isTodaySelected`에 따라 빈 상태 문구 반환 |

---

### `components/todo/FilterTabs.jsx`

전체 / 진행 중 / 완료 필터 탭 UI입니다.

| props | 타입 | 설명 |
|-------|------|------|
| `currentFilter` | `string` | 현재 선택된 필터 (`is-active` 클래스 적용 기준) |
| `onFilterChange` | `Function` | 탭 클릭 시 호출 `(filter) => void` |

| 상수 | 설명 |
|------|------|
| `FILTER_OPTIONS` | `[{ value, label }]` 형태의 탭 옵션 배열 |

---

### `components/view/WeekView.jsx`

선택된 날짜가 속한 주(월~일)를 7칸 셀로 표시합니다. 이전/다음 주 이동과 날짜 셀 클릭을 처리합니다.

| props | 타입 | 설명 |
|-------|------|------|
| `selectedDate` | `Date` | 현재 선택된 날짜 |
| `todoList` | `Array` | 전체 Todo 배열 (날짜별 개수 뱃지 계산용) |
| `onDateChange` | `Function` | 날짜 변경 콜백 `(newDate) => void` |

| 상수/변수 | 설명 |
|-----------|------|
| `WEEK_DAY_NAMES` | `['월', '화', ..., '일']` 요일 이름 배열 |
| `monday` | 선택 날짜가 속한 주의 월요일 Date 객체 |
| `sunday` | 선택 날짜가 속한 주의 일요일 Date 객체 |
| `todayStr` | 오늘 날짜 문자열 `'YYYY-MM-DD'` |
| `selectedStr` | 선택 날짜 문자열 `'YYYY-MM-DD'` |
| `todoCountByDate` | `{ 'YYYY-MM-DD': count }` 날짜별 Todo 개수 맵 |
| `weekCells` | `Array.from({ length: 7 })`으로 생성한 7개 셀 JSX 배열 |

| 함수 | 설명 |
|------|------|
| `handlePrevWeek()` | 7일 전 날짜로 `onDateChange` 호출 |
| `handleNextWeek()` | 7일 후 날짜로 `onDateChange` 호출 |
| `handleDaySelect(date)` | 클릭한 날짜로 `onDateChange` 호출 |

---

## 훅

### `hooks/useLocalStorage.js`

`localStorage` 읽기/쓰기를 `useState`처럼 사용할 수 있게 감싼 커스텀 훅입니다.

```js
const [value, setValue] = useLocalStorage(key, initialValue);
```

| 인자 | 설명 |
|------|------|
| `key` | localStorage 키 문자열 |
| `initialValue` | 저장된 값이 없을 때 사용할 초기값 |

| 반환 | 설명 |
|------|------|
| `storedValue` | 현재 저장된 값 |
| `setValue(value)` | 값 변경 시 state와 localStorage를 동시에 업데이트 |

---

### `hooks/useTodos.js`

Todo CRUD 전체 로직을 담당하는 커스텀 훅입니다. `useLocalStorage`를 내부에서 사용해 변경사항을 자동으로 저장합니다.

```js
const { todoList, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();
```

| 반환 | 설명 |
|------|------|
| `todoList` | 전체 Todo 배열 `[{ id, text, isDone, date }]` |
| `addTodo(text, date)` | 새 Todo 추가, `nextId` 자동 증가 |
| `toggleTodo(id)` | `isDone` 토글 |
| `deleteTodo(id)` | 해당 id Todo 삭제 |
| `updateTodo(id, newText)` | 해당 id Todo 텍스트 수정 |

---

## 유틸

### `utils/dateUtils.js`

날짜 관련 순수 함수 모음입니다. 컴포넌트 의존성 없이 어디서든 import해서 사용할 수 있습니다.

| 함수 | 인자 | 반환 | 설명 |
|------|------|------|------|
| `formatDate(date)` | `Date` | `'YYYY-MM-DD'` | 날짜를 키 문자열로 변환 |
| `formatDateLabel(date)` | `Date` | `'2025년 6월 3일 (화)'` | 헤더 날짜 표시용 포맷 |
| `formatWeekLabel(monday, sunday)` | `Date, Date` | `'6월 2일 – 8일'` | 주간 뷰 상단 라벨 포맷 |
| `getWeekMonday(date)` | `Date` | `Date` | 해당 날짜가 속한 주의 월요일 반환 (ISO 8601) |
| `buildTodoCountByDate(todoList)` | `Array` | `{ 'YYYY-MM-DD': count }` | 날짜별 Todo 개수 맵 생성 |

---

## 스타일

`src/index.css` 하나에서 전역 스타일을 관리합니다. 기존 Vanilla JS 버전의 `style.css`를 그대로 이식했으며 메인 컬러(`#672be0`)를 포함한 모든 CSS 변수가 유지됩니다.

| CSS 변수 | 값 | 용도 |
|----------|----|------|
| `--color-primary` | `#672be0` | 메인 컬러 |
| `--color-primary-light` | `#ede8fc` | 배경 강조, 탭 배경 |
| `--color-primary-dark` | `#4e1fb0` | 호버 시 진한 컬러 |
| `--color-bg` | `#f7f5ff` | 앱 배경 |
| `--color-surface` | `#ffffff` | 카드, 입력창 배경 |
| `--color-danger` | `#e03b3b` | 삭제, 에러 |
| `--color-success` | `#16a34a` | 완료 버튼 |
