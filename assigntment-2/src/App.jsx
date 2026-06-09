// App.jsx
// 기존: 전역 변수(todoList, nextId, currentFilter, selectedDate)와
//       DOM 이벤트 리스너들이 app.js 최상단에 분산
// 변경: 모든 전역 상태를 App 컴포넌트의 useState로 끌어올림(state lifting)

import { useState } from 'react';
import useTodos from './hooks/UseTodos';
import TodoInput from './components/todo/TodoInput';
import TodoList from './components/todo/TodoList';
import FilterTabs from './components/todo/FilterTabs';

function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date) {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekDays[date.getDay()]})`;
}

function App() {
  const { todoList, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedDate] = useState(new Date());

  const selectedDateStr = formatDate(selectedDate);
  const isTodaySelected = formatDate(new Date()) === selectedDateStr;

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
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
          {formatDateLabel(selectedDate)}
          {isTodaySelected && (
            <span style={{
              marginLeft: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              padding: '2px 8px',
              borderRadius: '99px',
            }}>오늘</span>
          )}
        </p>
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