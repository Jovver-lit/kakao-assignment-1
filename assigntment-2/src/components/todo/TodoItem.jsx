// TodoItem
// 기존: createTodoElement(todo) — document.createElement로 li 생성
//       handleStartEdit(id) — DOM 직접 조작으로 input 교체
//       handleSaveEdit(id) — DOM에서 input값 읽어 저장
// 변경: 편집 상태를 useState로 관리, DOM 조작 없이 조건부 렌더링으로 처리

import { useState, useRef, useEffect } from 'react';

/**
 * TodoItem
 * 단일 Todo 항목 — 텍스트 표시, 완료 토글, 인라인 편집, 삭제 담당
 * @param {Object}   todo       - { id, text, isDone, date }
 * @param {Function} onToggle   - 완료 토글 콜백
 * @param {Function} onDelete   - 삭제 콜백
 * @param {Function} onUpdate   - 수정 저장 콜백 (id, newText)
 */
function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  // 기존: handleStartEdit — DOM으로 input 요소를 직접 생성해 교체
  // 변경: isEditing state로 편집 모드 전환
  const [isEditing, setIsEditing] = useState(false);

  // 기존: editInput.value = targetTodo.text (DOM 직접 접근)
  // 변경: useState로 편집 중인 텍스트 관리
  const [editText, setEditText] = useState(todo.text);

  const editInputRef = useRef(null);

  // 기존: editInput.focus() + editInput.setSelectionRange(...)
  // 변경: useEffect로 편집 모드 진입 시 자동 포커스
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      const len = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  /**
   * handleStartEdit
   * 기존: DOM에서 textEl을 editInput으로 직접 교체
   * 변경: setIsEditing(true)로 조건부 렌더링 전환
   */
  const handleStartEdit = () => {
    setEditText(todo.text);
    setIsEditing(true);
  };

  /**
   * handleSaveEdit
   * 기존: listItem.querySelector('.todo-edit-input').value 로 DOM에서 값 읽기
   * 변경: editText state값을 그대로 사용
   */
  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      editInputRef.current?.focus();
      return;
    }
    onUpdate(todo.id, trimmed);
    setIsEditing(false);
  };

  /**
   * handleCancelEdit
   * 기존: Escape 키 → renderTodoList() 전체 재렌더링으로 편집 취소
   * 변경: setIsEditing(false)만으로 편집 취소
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter')  handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  return (
    // 기존: listItem.className = `todo-item${todo.isDone ? ' is-done' : ''}`
    <li className={`todo-item${todo.isDone ? ' is-done' : ''}`}>

      {/* 기존: 편집 모드 → DOM으로 input 교체 / 일반 모드 → span.todo-text */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          className="todo-edit-input"
          value={editText}
          maxLength={100}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
        />
      ) : (
        <span className="todo-text">{todo.text}</span>
      )}

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="btn-action btn-save" onClick={handleSaveEdit}>저장</button>
            <button className="btn-action btn-delete" onClick={() => onDelete(todo.id)}>삭제</button>
          </>
        ) : (
          <>
            {/* 기존: todo.isDone ? '↩ 취소' : '✓ 완료' */}
            <button
              className={`btn-action ${todo.isDone ? 'btn-undone' : 'btn-done'}`}
              onClick={() => onToggle(todo.id)}
            >
              {todo.isDone ? '↩ 취소' : '✓ 완료'}
            </button>
            {/* 기존: todo.isDone이면 disabled + opacity 0.4 인라인 스타일 */}
            <button
              className="btn-action btn-edit"
              onClick={handleStartEdit}
              disabled={todo.isDone}
              style={todo.isDone ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              ✎ 수정
            </button>
            <button className="btn-action btn-delete" onClick={() => onDelete(todo.id)}>
              ✕ 삭제
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TodoItem;