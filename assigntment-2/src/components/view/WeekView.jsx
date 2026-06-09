// WeekView
// 기존: renderWeekView() — weekDaysRow.innerHTML = '' 후 createElement + appendChild 반복
//       handleWeekDaySelect(date) — selectedDate 전역 변수 직접 수정
//       moveWeekByDays(days) — selectedDate 전역 변수 직접 수정
// 변경: selectedDate를 props로 받아 렌더링, 날짜 변경은 onDateChange 콜백으로 위임

import { formatDate, formatWeekLabel, getWeekMonday, buildTodoCountByDate } from '../../utils/dateUtils';

const WEEK_DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];

/**
 * WeekView
 * selectedDate가 속한 주(월~일) 7칸을 가로로 표시하는 컴포넌트
 * @param {Date}     selectedDate  - 현재 선택된 날짜
 * @param {Array}    todoList      - 전체 Todo 배열 (날짜별 개수 뱃지 계산용)
 * @param {Function} onDateChange  - 날짜 변경 콜백 (새 Date 객체를 인자로 전달)
 */
function WeekView({ selectedDate, todoList, onDateChange }) {
  // 기존: getWeekMonday(selectedDate) 호출 후 sunday 계산
  const monday = getWeekMonday(selectedDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const todayStr    = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);

  // 기존: buildTodoCountByDate() — 전역 todoList 참조
  // 변경: todoList를 인자로 전달
  const todoCountByDate = buildTodoCountByDate(todoList);

  /**
   * handlePrevWeek / handleNextWeek
   * 기존: moveWeekByDays(±7) — selectedDate 전역 변수 직접 수정 + 여러 render 함수 수동 호출
   * 변경: 새 날짜를 계산해 onDateChange 콜백으로 전달만 함 (렌더링은 React가 처리)
   */
  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  /**
   * handleDaySelect
   * 기존: handleWeekDaySelect(date) — selectedDate 전역 수정 + currentFilter 초기화 + 여러 render 호출
   * 변경: onDateChange 콜백으로 위임 (filter 초기화는 App에서 처리)
   */
  const handleDaySelect = (date) => {
    onDateChange(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  };

  // 기존: for 루프로 7개 셀 createElement
  // 변경: Array.from으로 7개 셀 배열 생성 후 map()으로 렌더링
  const weekCells = Array.from({ length: 7 }, (_, i) => {
    const cellDate    = new Date(monday);
    cellDate.setDate(monday.getDate() + i);
    const cellDateStr = formatDate(cellDate);
    const todoCount   = todoCountByDate[cellDateStr] || 0;
    const dayOfWeek   = cellDate.getDay(); // 0=일, 6=토

    // 기존: cell.classList.add(...) 조건별 분기
    // 변경: 조건을 문자열로 조합해 className에 한번에 적용
    const cellClass = [
      'week-day-cell',
      dayOfWeek === 0 ? 'sunday'      : '',
      dayOfWeek === 6 ? 'saturday'    : '',
      cellDateStr === todayStr    ? 'is-today'    : '',
      cellDateStr === selectedStr ? 'is-selected' : '',
      todoCount > 0               ? 'has-todo'    : '',
    ].filter(Boolean).join(' ');

    return (
      <button
        key={cellDateStr}
        className={cellClass}
        onClick={() => handleDaySelect(cellDate)}
      >
        {/* 기존: cell.innerHTML = `<span>...</span>` 템플릿 리터럴 */}
        <span className="week-day-name">{WEEK_DAY_NAMES[i]}</span>
        <span className="week-day-date">{cellDate.getDate()}</span>
        <span className="week-day-count">{todoCount}</span>
      </button>
    );
  });

  return (
    <div className="week-view">
      {/* 기존: <div class="week-nav"> — weekLabel.textContent + prevWeekButton/nextWeekButton addEventListener */}
      <div className="week-nav">
        <button className="btn-week-nav" onClick={handlePrevWeek}>&#8249;</button>
        <span className="week-label">{formatWeekLabel(monday, sunday)}</span>
        <button className="btn-week-nav" onClick={handleNextWeek}>&#8250;</button>
      </div>

      {/* 기존: <div id="weekDaysRow"> — innerHTML 초기화 후 셀 append */}
      <div className="week-days-row">
        {weekCells}
      </div>
    </div>
  );
}

export default WeekView;