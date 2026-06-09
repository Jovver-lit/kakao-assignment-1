// dateUtils.js
// 기존: formatDate, formatDateLabel, formatWeekLabel, getWeekMonday 전역 함수
// 변경: 순수 함수들을 utils로 분리해 여러 컴포넌트에서 재사용

/**
 * formatDate
 * 기존: formatDate(date) 전역 함수
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD'
 */
export function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * formatDateLabel
 * 기존: formatDateLabel(date) 전역 함수
 * @param {Date} date
 * @returns {string} '2025년 6월 3일 (화)'
 */
export function formatDateLabel(date) {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekDays[date.getDay()]})`;
}

/**
 * formatWeekLabel
 * 기존: formatWeekLabel(monday, sunday) 전역 함수
 * 같은 달: '6월 2일 – 8일' / 다른 달: '6월 30일 – 7월 6일'
 * @param {Date} monday
 * @param {Date} sunday
 * @returns {string}
 */
export function formatWeekLabel(monday, sunday) {
  const startMonth = monday.getMonth() + 1;
  const startDay   = monday.getDate();
  const endMonth   = sunday.getMonth() + 1;
  const endDay     = sunday.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}월 ${startDay}일 – ${endDay}일`;
  }
  return `${startMonth}월 ${startDay}일 – ${endMonth}월 ${endDay}일`;
}

/**
 * getWeekMonday
 * 기존: getWeekMonday(date) 전역 함수
 * 기준 날짜가 속한 주의 월요일 Date 객체를 반환 (ISO 8601, 한국 기준)
 * @param {Date} date
 * @returns {Date} 해당 주 월요일
 */
export function getWeekMonday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = d.getDay();
  // 일요일(0)이면 -6, 나머지는 1 - dayOfWeek
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

/**
 * buildTodoCountByDate
 * 기존: buildTodoCountByDate() 전역 함수 — 전역 todoList 직접 참조
 * 변경: todoList를 인자로 받는 순수 함수로 변경
 * @param {Array} todoList
 * @returns {Object} { 'YYYY-MM-DD': count }
 */
export function buildTodoCountByDate(todoList) {
  const countMap = {};
  todoList.forEach((todo) => {
    countMap[todo.date] = (countMap[todo.date] || 0) + 1;
  });
  return countMap;
}