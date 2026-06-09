// App.jsx
// 변경사항: selectedDate를 useState로 관리 (주간 뷰 날짜 이동 대응)
//           WeekView 컴포넌트 추가
//           formatDate, formatDateLabel을 dateUtils로 이동 후 import

import { useState } from 'react';
import useTodos from './hooks/useTodos';
import TodoInput from './components/todo/TodoInput';
import TodoList from './components/todo/TodoList';
import FilterTabs from './components/todo/FilterTabs';
import WeekView from './components/view/WeekView';
import { formatDate, formatDateLabel } from './utils/dateUtils';

function App() {
  const { todoList, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();

  // 기존: let currentFilter = 'all' 전역 변수
  const [currentFilter, setCurrentFilter] = useState('all');

  // 기존: let selectedDate = new Date() 전역 변수
  // 변경: useState로 관리 — WeekView의 날짜 클릭/주 이동 시 여기서 업데이트됨
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = formatDate(selectedDate);
  const isTodaySelected = formatDate(new Date()) === selectedDateStr;

  /**
   * handleDateChange
   * 기존: handleWeekDaySelect, moveWeekByDays 각각에서 selectedDate 직접 수정
   *       + currentFilter = 'all' + updateFilterTabStyles() + render 함수들 수동 호출
   * 변경: 날짜 변경 시 호출되는 단일 콜백으로 통합, React가 리렌더링 처리
   */
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setCurrentFilter('all');
  };

  const getFilteredTodoList = () => {
    const todosForDate = todoList.filter((todo) => todo.date === selectedDateStr);
    switch (currentFilter) {
      case 'active': return todosForDate.filter((todo) => !todo.isDone);
      case 'done':   return todosForDate.filter((todo) =>  todo.isDone);
      default:       return todosForDate;
    }
  };

  const handleAddTodo = (text) => {
    addTodo(text, selectedDateStr);
    if (currentFilter === 'done') setCurrentFilter('all');
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const filteredList = getFilteredTodoList();

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1 className="app-title">My Todos</h1>

        {/* 날짜 네비게이터 — 추후 컴포넌트 분리 예정 */}
        <div className="date-navigator">
          <button className="btn-date-nav" onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            handleDateChange(newDate);
          }}>&#8249;</button>

          <div className="date-center">
            <div className="date-display">
              <span className="date-text">{formatDateLabel(selectedDate)}</span>
              {isTodaySelected && (
                <span className="today-badge">오늘</span>
              )}
            </div>
          </div>

          <button className="btn-date-nav" onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            handleDateChange(newDate);
          }}>&#8250;</button>
        </div>

        {/* 주간 뷰 */}
        <WeekView
          selectedDate={selectedDate}
          todoList={todoList}
          onDateChange={handleDateChange}
        />
      </header>

      <TodoInput onAdd={handleAddTodo} />

      <FilterTabs
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />

      <section className="list-section">
        <TodoList
          filteredList={filteredList}
          currentFilter={currentFilter}
          isTodaySelected={isTodaySelected}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
        />
      </section>
    </div>
  );
}

export default App;