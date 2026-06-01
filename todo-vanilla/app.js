/* ===========================
   Todo 앱 - 메인 스크립트
   기능: 생성(Create), 읽기(Read), 수정(Update), 삭제(Delete)
=========================== */

// ── 상태 ──────────────────────────────────────────
/**
 * todoList: 현재 Todo 항목들을 담는 배열
 * 각 항목의 구조: { id: number, text: string, isDone: boolean }
 */
let todoList = [];

/**
 * nextId: 새로운 Todo에 부여할 고유 ID (매번 1씩 증가)
 */
let nextId = 1;

// ── DOM 참조 ──────────────────────────────────────
const todoInput     = document.getElementById('todoInput');
const addButton     = document.getElementById('addButton');
const todoListEl    = document.getElementById('todoList');
const errorMessage  = document.getElementById('errorMessage');
const emptyState    = document.getElementById('emptyState');

// ── 이벤트 등록 ───────────────────────────────────

// '추가' 버튼 클릭 시 Todo 생성
addButton.addEventListener('click', handleAddTodo);

// 입력창에서 Enter 키 입력 시 Todo 생성
todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleAddTodo();
});

// 입력창 타이핑 시 에러 메시지 초기화
todoInput.addEventListener('input', () => {
  hideError();
});

// ── Todo CRUD 핵심 함수들 ──────────────────────────

/**
 * handleAddTodo
 * 입력창의 값을 읽어 새 Todo를 추가하는 함수
 * 빈 값이면 에러 메시지를 표시하고 추가를 막는다
 */
function handleAddTodo() {
  const inputText = todoInput.value.trim();

  // 입력값이 비어있으면 안내 메시지 표시 후 종료
  if (!inputText) {
    showError();
    return;
  }

  // 새 Todo 객체 생성
  const newTodo = {
    id: nextId++,
    text: inputText,
    isDone: false,
  };

  // 배열에 추가
  todoList.push(newTodo);

  // 입력창 초기화
  todoInput.value = '';
  hideError();
  todoInput.focus();

  // 화면 업데이트
  renderTodoList();
}

/**
 * handleToggleDone
 * Todo의 완료 상태를 토글(완료 ↔ 미완료)하는 함수
 * @param {number} id - 대상 Todo의 ID
 */
function handleToggleDone(id) {
  todoList = todoList.map((todo) => {
    if (todo.id === id) {
      return { ...todo, isDone: !todo.isDone };
    }
    return todo;
  });
  renderTodoList();
}

/**
 * handleDeleteTodo
 * 특정 Todo를 목록에서 제거하는 함수
 * @param {number} id - 삭제할 Todo의 ID
 */
function handleDeleteTodo(id) {
  todoList = todoList.filter((todo) => todo.id !== id);
  renderTodoList();
}

/**
 * handleStartEdit
 * 특정 Todo 항목을 수정 모드로 전환하는 함수
 * 텍스트 영역을 인라인 입력창으로 교체한다
 * @param {number} id - 수정할 Todo의 ID
 */
function handleStartEdit(id) {
  const targetTodo = todoList.find((todo) => todo.id === id);
  if (!targetTodo) return;

  // 해당 li 요소 찾기
  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  // 텍스트 영역 → 인라인 입력창으로 교체
  const textEl = listItem.querySelector('.todo-text');
  const actionsEl = listItem.querySelector('.todo-actions');

  // 인라인 입력창 생성
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-edit-input';
  editInput.value = targetTodo.text;
  editInput.maxLength = 100;

  // 텍스트 요소를 인라인 입력창으로 교체
  listItem.replaceChild(editInput, textEl);

  // 액션 버튼들을 '저장' 버튼으로 교체
  actionsEl.innerHTML = `
    <button class="btn-action btn-save" onclick="handleSaveEdit(${id})">저장</button>
    <button class="btn-action btn-delete" onclick="handleDeleteTodo(${id})">삭제</button>
  `;

  // 입력창에 포커스 + 텍스트 끝으로 커서 이동
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  // 수정 입력창에서 Enter 키 누르면 저장
  editInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSaveEdit(id);
    if (event.key === 'Escape') renderTodoList(); // ESC 누르면 수정 취소
  });
}

/**
 * handleSaveEdit
 * 수정 입력창의 값을 저장하고 일반 표시 모드로 돌아가는 함수
 * @param {number} id - 저장할 Todo의 ID
 */
function handleSaveEdit(id) {
  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  const editInput = listItem.querySelector('.todo-edit-input');
  if (!editInput) return;

  const newText = editInput.value.trim();

  // 빈 값이면 저장하지 않고 그대로 유지
  if (!newText) {
    editInput.focus();
    return;
  }

  // 배열 내 해당 Todo의 텍스트 업데이트
  todoList = todoList.map((todo) => {
    if (todo.id === id) {
      return { ...todo, text: newText };
    }
    return todo;
  });

  // 화면 업데이트
  renderTodoList();
}

// ── 렌더링 함수 ───────────────────────────────────

/**
 * renderTodoList
 * 현재 todoList 배열을 바탕으로 DOM을 다시 그리는 함수
 * 빈 상태 메시지도 이 함수에서 제어한다
 */
function renderTodoList() {
  // 목록 초기화
  todoListEl.innerHTML = '';

  // 빈 상태 처리: Todo가 없으면 안내 메시지 표시
  if (todoList.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  // Todo가 있으면 빈 상태 숨기기
  emptyState.classList.add('hidden');

  // 각 Todo 항목을 li 요소로 생성해서 목록에 추가
  todoList.forEach((todo) => {
    const listItem = createTodoElement(todo);
    todoListEl.appendChild(listItem);
  });
}

/**
 * createTodoElement
 * 단일 Todo 객체를 받아 li DOM 요소를 만들어 반환하는 함수
 * @param {Object} todo - { id, text, isDone }
 * @returns {HTMLElement} - 완성된 li 요소
 */
function createTodoElement(todo) {
  const listItem = document.createElement('li');
  listItem.className = `todo-item${todo.isDone ? ' is-done' : ''}`;
  listItem.dataset.id = todo.id; // data-id 속성으로 ID 저장

  // 완료/미완료에 따라 버튼 텍스트 변경
  const doneButtonLabel = todo.isDone ? '↩ 취소' : '✓ 완료';
  const doneButtonClass = todo.isDone ? 'btn-undone' : 'btn-done';

  listItem.innerHTML = `
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <div class="todo-actions">
      <button
        class="btn-action ${doneButtonClass}"
        onclick="handleToggleDone(${todo.id})"
      >${doneButtonLabel}</button>
      <button
        class="btn-action btn-edit"
        onclick="handleStartEdit(${todo.id})"
        ${todo.isDone ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}
      >✎ 수정</button>
      <button
        class="btn-action btn-delete"
        onclick="handleDeleteTodo(${todo.id})"
      >✕ 삭제</button>
    </div>
  `;

  return listItem;
}

// ── 유틸리티 함수들 ───────────────────────────────

/**
 * showError
 * 에러 메시지를 표시하고 입력창에 에러 스타일을 적용하는 함수
 */
function showError() {
  errorMessage.classList.remove('hidden');
  todoInput.classList.add('is-error');
  todoInput.focus();
}

/**
 * hideError
 * 에러 메시지를 숨기고 입력창의 에러 스타일을 제거하는 함수
 */
function hideError() {
  errorMessage.classList.add('hidden');
  todoInput.classList.remove('is-error');
}

/**
 * escapeHtml
 * XSS 방지를 위해 사용자 입력의 특수문자를 HTML 엔티티로 변환하는 함수
 * @param {string} text - 원본 텍스트
 * @returns {string} - 이스케이프된 텍스트
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ── 초기 렌더링 ───────────────────────────────────
// 페이지 로드 시 초기 상태(빈 목록) 렌더링
renderTodoList();