// TodoInput
// 기존: <input id="todoInput"> + <button id="addButton"> (HTML 하드코딩)
//       handleAddTodo(), showError(), hideError() 전역 함수
// 변경: 입력 상태와 에러 상태를 useState로 관리, 로직을 컴포넌트 내부로 캡슐화

import { useState, useRef } from 'react';

/**
 * TodoInput
 * 할 일 텍스트 입력 + 추가 버튼 + 유효성 에러 메시지를 담당하는 컴포넌트
 * @param {Function} onAdd - 유효한 텍스트 입력 시 호출되는 콜백 (text를 인자로 전달)
 */
function TodoInput({ onAdd }) {
  // 기존: todoInput.value (DOM 직접 접근)
  // 변경: useState로 입력값 관리
  const [inputText, setInputText] = useState('');

  // 기존: errorMessage.classList.add/remove('hidden') (DOM 직접 조작)
  // 변경: useState로 에러 표시 여부 관리
  const [isError, setIsError] = useState(false);

  const inputRef = useRef(null);

  /**
   * handleAdd
   * 기존: handleAddTodo() — todoInput.value.trim() 검사 후 push
   * 변경: 텍스트만 검증하고 실제 추가는 onAdd 콜백으로 위임
   */
  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      // 기존: showError() — errorMessage classList 조작 + todoInput.focus()
      setIsError(true);
      inputRef.current?.focus();
      return;
    }
    onAdd(trimmed);
    setInputText('');
    setIsError(false);
    inputRef.current?.focus();
  };

  /**
   * handleKeyDown
   * 기존: todoInput.addEventListener('keydown', e => if e.key==='Enter' handleAddTodo())
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  /**
   * handleChange
   * 기존: todoInput.addEventListener('input', () => hideError())
   */
  const handleChange = (e) => {
    setInputText(e.target.value);
    if (isError) setIsError(false);
  };

  return (
    <section className="input-section">
      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          className={`todo-input${isError ? ' is-error' : ''}`}
          placeholder="할 일을 입력하세요..."
          maxLength={100}
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-add" onClick={handleAdd}>
          추가
        </button>
      </div>
      {/* 기존: <p id="errorMessage" class="error-message hidden"> */}
      {isError && (
        <p className="error-message">할 일을 입력해주세요.</p>
      )}
    </section>
  );
}

export default TodoInput;