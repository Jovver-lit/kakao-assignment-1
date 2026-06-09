// TodoList
// 기존: renderTodoList() — todoListEl.innerHTML = '' 후 forEach로 createElement + appendChild
//       getEmptyMessage() — currentFilter, isTodaySelected()에 따라 빈 상태 메시지 반환
// 변경: filteredList를 props로 받아 map()으로 선언적 렌더링

import TodoItem from './TodoItem';

/**
 * TodoList
 * 필터링된 Todo 배열을 받아 목록 또는 빈 상태 메시지를 렌더링
 * @param {Array}    filteredList - 이미 필터링된 Todo 배열
 * @param {string}   currentFilter - 'all' | 'active' | 'done'
 * @param {boolean}  isTodaySelected - 선택된 날짜가 오늘인지 여부
 * @param {Function} onToggle  - 완료 토글 콜백
 * @param {Function} onDelete  - 삭제 콜백
 * @param {Function} onUpdate  - 수정 저장 콜백
 */
function TodoList({ filteredList, currentFilter, isTodaySelected, onToggle, onDelete, onUpdate }) {

  /**
   * getEmptyMessage
   * 기존: getEmptyMessage() 전역 함수 — currentFilter, isTodaySelected() 전역 참조
   * 변경: props를 참조하는 컴포넌트 내부 함수로 이동
   */
  const getEmptyMessage = () => {
    switch (currentFilter) {
      case 'active': return '진행 중인 할 일이 없어요.\n모두 완료했나요? 🎉';
      case 'done':   return '완료된 할 일이 없어요.\n할 일을 완료해보세요!';
      default:
        return isTodaySelected
          ? '오늘 할 일이 없어요.\n위에서 추가해보세요!'
          : '이 날의 할 일이 없어요.';
    }
  };

  // 기존: emptyState.classList.remove/add('hidden') — DOM 직접 조작
  // 변경: 조건부 렌더링으로 처리
  if (filteredList.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <p style={{ whiteSpace: 'pre-line' }}>{getEmptyMessage()}</p>
      </div>
    );
  }

  return (
    // 기존: <ul id="todoList"> + forEach로 li 직접 append
    // 변경: map()으로 선언적 렌더링
    <ul className="todo-list">
      {filteredList.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}

export default TodoList;