# Todo App — Next.js + FastAPI 풀스택

Vanilla JS → React(Vite) → Next.js + FastAPI 순으로 마이그레이션한 Todo 앱입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js (App Router), TypeScript, Tailwind CSS |
| 백엔드 | FastAPI, SQLAlchemy, Pydantic |
| 데이터베이스 | SQLite |

---

## 파일 구조

```
kakao-asignment-3/
├── backend/
│   ├── main.py               # FastAPI 앱 전체 (모델, 스키마, 엔드포인트)
│   └── requirements.txt      # 패키지 목록
│
└── frontend/
    ├── app/
    │   ├── layout.tsx             # 루트 레이아웃
    │   ├── page.tsx               # 루트 → /todos 리다이렉트
    │   ├── actions.ts             # Server Actions
    │   ├── api/todos/
    │   │   ├── route.ts           # GET / POST API Route
    │   │   └── [todoId]/
    │   │       └── route.ts       # PUT / DELETE API Route
    │   └── todos/
    │       ├── page.tsx           # Todo 목록 페이지 (Server Component)
    │       ├── error.tsx          # 에러 화면
    │       ├── loading.tsx        # 로딩 화면
    │       ├── components/
    │       │   └── TodoApp.tsx    # 메인 Client Component
    │       ├── new/
    │       │   ├── page.tsx       # Todo 생성 페이지
    │       │   └── components/
    │       │       └── NewTodoForm.tsx
    │       └── [todoId]/
    │           ├── page.tsx       # Todo 수정 페이지
    │           └── components/
    │               └── EditTodoForm.tsx
    ├── globals.css                # 전역 스타일
    ├── tailwind.config.js         # Tailwind 설정
    └── postcss.config.js          # PostCSS 설정
```

---

## 마이그레이션 히스토리

| 단계 | 기술 | 주요 변경 |
|------|------|----------|
| 1차 | Vanilla JS | DOM 직접 조작, localStorage 저장 |
| 2차 | React (Vite) | 컴포넌트 분리, 커스텀 훅, useState |
| 3차 | Next.js + FastAPI | Server/Client Component 분리, DB 저장, REST API |