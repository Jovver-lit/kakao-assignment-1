// useTodos
// 기존: todoList(전역 변수) + nextId(전역 변수) + handleAddTodo/handleToggleDone/handleDeleteTodo/handleSaveEdit (전역 함수)
// 변경: 상태와 CRUD 로직을 하나의 hook으로 캡슐화

import useLocalStorage from './useLocalStorage';

const STORAGE_KEY_TODO_LIST = 'todoApp_todoList';
const STORAGE_KEY_NEXT_ID   = 'todoApp_nextId';

/**
 * useTodos
 * Todo CRUD 전체를 관리하는 커스텀 hook
 * @returns {{ todoList, addTodo, toggleTodo, deleteTodo, updateTodo }}
 */
function useTodos() {
  // 기존: let todoList = [] → loadFromLocalStorage()로 초기화
  const [todoList, setTodoList] = useLocalStorage(STORAGE_KEY_TODO_LIST, []);

  // 기존: let nextId = 1 → loadFromLocalStorage()로 초기화
  const [nextId, setNextId] = useLocalStorage(STORAGE_KEY_NEXT_ID, 1);

  /**
   * addTodo
   * 기존: handleAddTodo() — todoList.push(newTodo) + saveToLocalStorage()
   * 변경: setTodoList로 불변 업데이트, 날짜를 인자로 받음
   * @param {string} text - 입력된 할 일 텍스트
   * @param {string} date - 'YYYY-MM-DD' 형식의 날짜 문자열
   */
  const addTodo = (text, date) => {
    const newTodo = {
      id:     nextId,
      text,
      isDone: false,
      date,
    };
    setTodoList((prev) => [...prev, newTodo]);
    setNextId((prev) => prev + 1);
  };

  /**
   * toggleTodo
   * 기존: handleToggleDone(id) — todoList.map으로 isDone 토글 + saveToLocalStorage()
   * @param {number} id - 토글할 Todo의 id
   */
  const toggleTodo = (id) => {
    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  /**
   * deleteTodo
   * 기존: handleDeleteTodo(id) — todoList.filter + saveToLocalStorage()
   * @param {number} id - 삭제할 Todo의 id
   */
  const deleteTodo = (id) => {
    setTodoList((prev) => prev.filter((todo) => todo.id !== id));
  };

  /**
   * updateTodo
   * 기존: handleSaveEdit(id) — DOM에서 input 값을 직접 읽어 todoList.map + saveToLocalStorage()
   * 변경: 새 텍스트를 인자로 받아 불변 업데이트 (DOM 접근 제거)
   * @param {number} id - 수정할 Todo의 id
   * @param {string} newText - 수정된 텍스트
   */
  const updateTodo = (id, newText) => {
    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  return { todoList, addTodo, toggleTodo, deleteTodo, updateTodo };
}

export default useTodos;