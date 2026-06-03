/* ===========================
   Todo 앱 - 메인 스크립트
   기능: CRUD, 필터링, 일간 뷰, 주간 뷰, 달력 팝업, 로컬스토리지
=========================== */

// ── 로컬스토리지 키 상수 ──────────────────────────
const STORAGE_KEY_TODO_LIST = 'todoApp_todoList';
const STORAGE_KEY_NEXT_ID   = 'todoApp_nextId';

// ── 로컬스토리지 함수 ─────────────────────────────

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_TODO_LIST, JSON.stringify(todoList));
    localStorage.setItem(STORAGE_KEY_NEXT_ID,   JSON.stringify(nextId));
  } catch (error) {
    console.error('로컬스토리지 저장 실패:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const savedTodoList = localStorage.getItem(STORAGE_KEY_TODO_LIST);
    todoList = savedTodoList ? JSON.parse(savedTodoList) : [];

    const savedNextId = localStorage.getItem(STORAGE_KEY_NEXT_ID);
    nextId = savedNextId ? JSON.parse(savedNextId) : 1;
  } catch (error) {
    console.error('로컬스토리지 불러오기 실패:', error);
    todoList = [];
    nextId   = 1;
  }
}

// ── 상태 ──────────────────────────────────────────

/** todoList: 전체 Todo 배열. 구조: { id, text, isDone, date } */
let todoList = [];

/** nextId: 신규 Todo에 부여할 고유 ID */
let nextId = 1;

/** currentFilter: 'all' | 'active' | 'done' */
let currentFilter = 'all';

/** selectedDate: 현재 선택된 날짜 (Date 객체, 오늘로 초기화) */
let selectedDate = new Date();

/**
 * calendarViewDate: 달력 팝업에서 보여주는 연/월 기준 Date 객체
 * selectedDate와 독립적으로 관리
 */
let calendarViewDate = new Date();

/** isCalendarOpen: 달력 팝업 열림 여부 */
let isCalendarOpen = false;

// ── DOM 참조 ──────────────────────────────────────
const todoInput            = document.getElementById('todoInput');
const addButton            = document.getElementById('addButton');
const todoListEl           = document.getElementById('todoList');
const errorMessage         = document.getElementById('errorMessage');
const emptyState           = document.getElementById('emptyState');
const emptyMessage         = document.getElementById('emptyMessage');
const prevDateButton       = document.getElementById('prevDateButton');
const nextDateButton       = document.getElementById('nextDateButton');
const dateText             = document.getElementById('dateText');
const todayBadge           = document.getElementById('todayBadge');
const calendarToggleButton = document.getElementById('calendarToggleButton');
const calendarPopup        = document.getElementById('calendarPopup');
const prevMonthButton      = document.getElementById('prevMonthButton');
const nextMonthButton      = document.getElementById('nextMonthButton');
const calendarMonthLabel   = document.getElementById('calendarMonthLabel');
const calendarGrid         = document.getElementById('calendarGrid');
const prevWeekButton       = document.getElementById('prevWeekButton');
const nextWeekButton       = document.getElementById('nextWeekButton');
const weekLabel            = document.getElementById('weekLabel');
const weekDaysRow          = document.getElementById('weekDaysRow');

const filterTabButtons = document.querySelectorAll('.filter-tab');

// ── 이벤트 등록 ───────────────────────────────────

addButton.addEventListener('click', handleAddTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleAddTodo();
});

todoInput.addEventListener('input', () => hideError());

// 하루 단위 이전/다음 이동
prevDateButton.addEventListener('click', () => moveDateByDays(-1));
nextDateButton.addEventListener('click', () => moveDateByDays(1));

// 달력 팝업 토글
calendarToggleButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleCalendarPopup();
});

prevMonthButton.addEventListener('click', (event) => {
  event.stopPropagation();
  moveCalendarMonth(-1);
});

nextMonthButton.addEventListener('click', (event) => {
  event.stopPropagation();
  moveCalendarMonth(1);
});

// 주간 뷰 이전/다음 주 이동
prevWeekButton.addEventListener('click', () => moveWeekByDays(-7));
nextWeekButton.addEventListener('click', () => moveWeekByDays(7));

// 팝업 외부 클릭 시 닫기
document.addEventListener('click', (event) => {
  if (isCalendarOpen && !calendarPopup.contains(event.target)) {
    closeCalendarPopup();
  }
});

filterTabButtons.forEach((tabButton) => {
  tabButton.addEventListener('click', () => {
    handleFilterChange(tabButton.dataset.filter);
  });
});

// ── 주간 뷰 함수 ──────────────────────────────────

/**
 * getWeekMonday
 * 기준 날짜가 속한 주의 월요일 Date 객체를 반환하는 함수
 * 한국 기준 주 시작은 월요일 (ISO 8601)
 * @param {Date} date - 기준 날짜
 * @returns {Date} - 해당 주의 월요일
 */
function getWeekMonday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay(): 0=일, 1=월 ... 6=토
  // 일요일(0)은 -6, 나머지는 1-dayOfWeek 만큼 빼면 월요일
  const dayOfWeek = d.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

/**
 * moveWeekByDays
 * selectedDate를 7일 앞/뒤로 이동해 주간 뷰를 전환하는 함수
 * @param {number} days - 이동할 일수 (±7)
 */
function moveWeekByDays(days) {
  selectedDate = new Date(selectedDate);
  selectedDate.setDate(selectedDate.getDate() + days);

  currentFilter = 'all';
  updateFilterTabStyles();

  // 달력 팝업이 열려있으면 함께 갱신
  if (isCalendarOpen) {
    calendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderCalendar();
  }

  renderDateNavigator();
  renderWeekView();
  renderTodoList();
}

/**
 * renderWeekView
 * selectedDate가 속한 주(월~일)를 주간 뷰에 렌더링하는 함수
 * - 각 셀에 요일명, 날짜, Todo 개수 뱃지를 표시
 * - 오늘/선택 날짜/Todo 유무에 따라 클래스를 부여
 */
function renderWeekView() {
  const monday = getWeekMonday(selectedDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // 주 라벨: '6월 2일 – 6월 8일' 형식
  weekLabel.textContent = formatWeekLabel(monday, sunday);

  const todayStr    = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);

  // 날짜별 Todo 개수 맵: { 'YYYY-MM-DD': count }
  const todoCountByDate = buildTodoCountByDate();

  const weekDayNames = ['월', '화', '수', '목', '금', '토', '일'];

  weekDaysRow.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + i);
    const cellDateStr = formatDate(cellDate);

    const todoCount = todoCountByDate[cellDateStr] || 0;
    const dayOfWeek = cellDate.getDay(); // 0=일, 6=토

    // 셀 버튼 생성
    const cell = document.createElement('button');
    cell.className = 'week-day-cell';

    // 요일 클래스
    if (dayOfWeek === 0) cell.classList.add('sunday');
    if (dayOfWeek === 6) cell.classList.add('saturday');

    // 오늘 강조
    if (cellDateStr === todayStr)    cell.classList.add('is-today');

    // 선택 날짜 강조
    if (cellDateStr === selectedStr) cell.classList.add('is-selected');

    // Todo 존재 표시
    if (todoCount > 0) cell.classList.add('has-todo');

    // 셀 내용 구성
    cell.innerHTML = `
      <span class="week-day-name">${weekDayNames[i]}</span>
      <span class="week-day-date">${cellDate.getDate()}</span>
      <span class="week-day-count">${todoCount}</span>
    `;

    // 클릭 시 해당 날짜로 이동
    cell.addEventListener('click', () => {
      handleWeekDaySelect(cellDate);
    });

    weekDaysRow.appendChild(cell);
  }
}

/**
 * handleWeekDaySelect
 * 주간 뷰에서 날짜 셀 클릭 시 selectedDate를 변경하고 화면을 갱신하는 함수
 * @param {Date} date - 클릭한 날짜
 */
function handleWeekDaySelect(date) {
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  currentFilter = 'all';
  updateFilterTabStyles();

  // 달력 팝업이 열려있으면 해당 월로 이동
  if (isCalendarOpen) {
    calendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderCalendar();
  }

  renderDateNavigator();
  renderWeekView(); // 선택 날짜 강조 갱신
  renderTodoList();
}

/**
 * buildTodoCountByDate
 * todoList를 날짜별로 집계해 { 'YYYY-MM-DD': count } 맵을 반환하는 함수
 * 주간 뷰 뱃지 표시에 사용
 * @returns {Object}
 */
function buildTodoCountByDate() {
  const countMap = {};
  todoList.forEach((todo) => {
    countMap[todo.date] = (countMap[todo.date] || 0) + 1;
  });
  return countMap;
}

/**
 * formatWeekLabel
 * 주간 뷰 상단에 표시할 '6월 2일 – 6월 8일' 형식의 문자열을 반환하는 함수
 * 같은 달이면 '6월 30일 – 7월 6일' 형식으로 월도 표시
 * @param {Date} monday - 해당 주 월요일
 * @param {Date} sunday - 해당 주 일요일
 * @returns {string}
 */
function formatWeekLabel(monday, sunday) {
  const startMonth = monday.getMonth() + 1;
  const startDay   = monday.getDate();
  const endMonth   = sunday.getMonth() + 1;
  const endDay     = sunday.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}월 ${startDay}일 – ${endDay}일`;
  }
  return `${startMonth}월 ${startDay}일 – ${endMonth}월 ${endDay}일`;
}

// ── 달력 팝업 함수 ────────────────────────────────

function toggleCalendarPopup() {
  isCalendarOpen ? closeCalendarPopup() : openCalendarPopup();
}

function openCalendarPopup() {
  calendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  isCalendarOpen   = true;
  calendarPopup.classList.remove('hidden');
  renderCalendar();
}

function closeCalendarPopup() {
  isCalendarOpen = false;
  calendarPopup.classList.add('hidden');
}

function moveCalendarMonth(delta) {
  calendarViewDate = new Date(
    calendarViewDate.getFullYear(),
    calendarViewDate.getMonth() + delta,
    1
  );
  renderCalendar();
}

/**
 * renderCalendar
 * calendarViewDate 기준 월의 달력 그리드를 렌더링하는 함수
 */
function renderCalendar() {
  const viewYear  = calendarViewDate.getFullYear();
  const viewMonth = calendarViewDate.getMonth();

  calendarMonthLabel.textContent = `${viewYear}년 ${viewMonth + 1}월`;

  const firstDayOfMonth     = new Date(viewYear, viewMonth, 1).getDay();
  const lastDateOfMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();
  const lastDateOfPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr    = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);
  const datesWithTodo = new Set(todoList.map((todo) => todo.date));

  calendarGrid.innerHTML = '';

  for (let cellIndex = 0; cellIndex < 42; cellIndex++) {
    const button = document.createElement('button');
    button.className = 'calendar-day';

    let cellDate;

    if (cellIndex < firstDayOfMonth) {
      const prevDay = lastDateOfPrevMonth - firstDayOfMonth + cellIndex + 1;
      cellDate = new Date(viewYear, viewMonth - 1, prevDay);
      button.classList.add('other-month');
    } else if (cellIndex < firstDayOfMonth + lastDateOfMonth) {
      cellDate = new Date(viewYear, viewMonth, cellIndex - firstDayOfMonth + 1);
    } else {
      cellDate = new Date(viewYear, viewMonth + 1, cellIndex - firstDayOfMonth - lastDateOfMonth + 1);
      button.classList.add('other-month');
    }

    const cellDateStr = formatDate(cellDate);
    button.textContent = cellDate.getDate();

    const dow = cellDate.getDay();
    if (dow === 0) button.classList.add('sunday');
    if (dow === 6) button.classList.add('saturday');
    if (cellDateStr === todayStr)    button.classList.add('is-today');
    if (cellDateStr === selectedStr) button.classList.add('is-selected');
    if (datesWithTodo.has(cellDateStr)) button.classList.add('has-todo');

    button.addEventListener('click', () => handleCalendarDaySelect(cellDate));
    calendarGrid.appendChild(button);
  }
}

/**
 * handleCalendarDaySelect
 * 달력 팝업에서 날짜 클릭 시 selectedDate 변경 + 주간 뷰 갱신 + 팝업 닫기
 */
function handleCalendarDaySelect(date) {
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  currentFilter = 'all';
  updateFilterTabStyles();

  closeCalendarPopup();
  renderDateNavigator();
  renderWeekView();
  renderTodoList();
}

// ── 날짜 관련 함수 ────────────────────────────────

/**
 * moveDateByDays
 * 하루 단위 이전/다음 버튼 클릭 시 selectedDate 이동
 * 주간 뷰도 함께 갱신
 */
function moveDateByDays(days) {
  selectedDate = new Date(selectedDate);
  selectedDate.setDate(selectedDate.getDate() + days);

  currentFilter = 'all';
  updateFilterTabStyles();

  if (isCalendarOpen) {
    calendarViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderCalendar();
  }

  renderDateNavigator();
  renderWeekView();
  renderTodoList();
}

/**
 * formatDate: Date 객체 → 'YYYY-MM-DD' 문자열
 */
function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * formatDateLabel: Date 객체 → '2025년 6월 3일 (화)' 형식
 */
function formatDateLabel(date) {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekDays[date.getDay()]})`;
}

function isTodaySelected() {
  return formatDate(new Date()) === formatDate(selectedDate);
}

/**
 * renderDateNavigator
 * 상단 날짜 텍스트와 오늘 뱃지 갱신
 */
function renderDateNavigator() {
  dateText.textContent = formatDateLabel(selectedDate);
  if (isTodaySelected()) {
    todayBadge.classList.remove('hidden');
  } else {
    todayBadge.classList.add('hidden');
  }
}

// ── 필터 함수 ─────────────────────────────────────

function handleFilterChange(filter) {
  currentFilter = filter;
  updateFilterTabStyles();
  renderTodoList();
}

function updateFilterTabStyles() {
  filterTabButtons.forEach((tabButton) => {
    if (tabButton.dataset.filter === currentFilter) {
      tabButton.classList.add('is-active');
    } else {
      tabButton.classList.remove('is-active');
    }
  });
}

function getFilteredTodoList() {
  const selectedDateStr = formatDate(selectedDate);
  const todosForDate = todoList.filter((todo) => todo.date === selectedDateStr);

  switch (currentFilter) {
    case 'active': return todosForDate.filter((todo) => !todo.isDone);
    case 'done':   return todosForDate.filter((todo) =>  todo.isDone);
    default:       return todosForDate;
  }
}

// ── Todo CRUD ─────────────────────────────────────

function handleAddTodo() {
  const inputText = todoInput.value.trim();
  if (!inputText) { showError(); return; }

  const newTodo = {
    id:     nextId++,
    text:   inputText,
    isDone: false,
    date:   formatDate(selectedDate),
  };

  todoList.push(newTodo);
  saveToLocalStorage();

  todoInput.value = '';
  hideError();
  todoInput.focus();

  // Todo 추가 후 주간 뷰의 개수 뱃지 즉시 갱신
  renderWeekView();
  if (isCalendarOpen) renderCalendar();
  if (currentFilter === 'done') { handleFilterChange('all'); return; }
  renderTodoList();
}

function handleToggleDone(id) {
  todoList = todoList.map((todo) =>
    todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
  );
  saveToLocalStorage();
  renderTodoList();
}

function handleDeleteTodo(id) {
  todoList = todoList.filter((todo) => todo.id !== id);
  saveToLocalStorage();

  // 삭제 후 주간 뷰 뱃지 갱신
  renderWeekView();
  if (isCalendarOpen) renderCalendar();
  renderTodoList();
}

function handleStartEdit(id) {
  const targetTodo = todoList.find((todo) => todo.id === id);
  if (!targetTodo) return;

  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  const textEl    = listItem.querySelector('.todo-text');
  const actionsEl = listItem.querySelector('.todo-actions');

  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'todo-edit-input';
  editInput.value     = targetTodo.text;
  editInput.maxLength = 100;

  listItem.replaceChild(editInput, textEl);
  actionsEl.innerHTML = `
    <button class="btn-action btn-save" onclick="handleSaveEdit(${id})">저장</button>
    <button class="btn-action btn-delete" onclick="handleDeleteTodo(${id})">삭제</button>
  `;

  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);
  editInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter')  handleSaveEdit(id);
    if (event.key === 'Escape') renderTodoList();
  });
}

function handleSaveEdit(id) {
  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  const editInput = listItem.querySelector('.todo-edit-input');
  if (!editInput) return;

  const newText = editInput.value.trim();
  if (!newText) { editInput.focus(); return; }

  todoList = todoList.map((todo) =>
    todo.id === id ? { ...todo, text: newText } : todo
  );
  saveToLocalStorage();
  renderTodoList();
}

// ── 렌더링 함수 ───────────────────────────────────

function renderTodoList() {
  todoListEl.innerHTML = '';
  const filteredList = getFilteredTodoList();

  if (filteredList.length === 0) {
    emptyState.classList.remove('hidden');
    emptyMessage.innerHTML = getEmptyMessage();
    return;
  }

  emptyState.classList.add('hidden');
  filteredList.forEach((todo) => {
    todoListEl.appendChild(createTodoElement(todo));
  });
}

function getEmptyMessage() {
  switch (currentFilter) {
    case 'active': return '진행 중인 할 일이 없어요.<br />모두 완료했나요? 🎉';
    case 'done':   return '완료된 할 일이 없어요.<br />할 일을 완료해보세요!';
    default:
      return isTodaySelected()
        ? '오늘 할 일이 없어요.<br />위에서 추가해보세요!'
        : '이 날의 할 일이 없어요.';
  }
}

function createTodoElement(todo) {
  const listItem = document.createElement('li');
  listItem.className  = `todo-item${todo.isDone ? ' is-done' : ''}`;
  listItem.dataset.id = todo.id;

  const doneButtonLabel = todo.isDone ? '↩ 취소' : '✓ 완료';
  const doneButtonClass = todo.isDone ? 'btn-undone' : 'btn-done';

  listItem.innerHTML = `
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <div class="todo-actions">
      <button class="btn-action ${doneButtonClass}" onclick="handleToggleDone(${todo.id})">${doneButtonLabel}</button>
      <button class="btn-action btn-edit" onclick="handleStartEdit(${todo.id})"
        ${todo.isDone ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>✎ 수정</button>
      <button class="btn-action btn-delete" onclick="handleDeleteTodo(${todo.id})">✕ 삭제</button>
    </div>
  `;
  return listItem;
}

// ── 유틸리티 ──────────────────────────────────────

function showError() {
  errorMessage.classList.remove('hidden');
  todoInput.classList.add('is-error');
  todoInput.focus();
}

function hideError() {
  errorMessage.classList.add('hidden');
  todoInput.classList.remove('is-error');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ── 초기화 ────────────────────────────────────────
loadFromLocalStorage();
renderDateNavigator();
renderWeekView();   // 주간 뷰 초기 렌더링
renderTodoList();