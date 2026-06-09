// useLocalStorage
// 기존: saveToLocalStorage(), loadFromLocalStorage() 전역 함수
// 변경: 초기값 로딩 + 자동 저장을 하나의 hook으로 캡슐화

import { useState } from 'react';

/**
 * useLocalStorage
 * localStorage 읽기/쓰기를 useState처럼 사용할 수 있게 감싼 커스텀 hook
 * @param {string} key - localStorage 키
 * @param {*} initialValue - 저장된 값이 없을 때 사용할 초기값
 * @returns {[*, Function]} - [저장된 값, setter 함수]
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    // 기존: loadFromLocalStorage() → localStorage.getItem + JSON.parse
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('로컬스토리지 불러오기 실패:', error);
      return initialValue;
    }
  });

  /**
   * setValue
   * 기존: saveToLocalStorage() → localStorage.setItem + JSON.stringify
   * @param {*} value - 저장할 값 (함수도 가능, prevState 패턴 지원)
   */
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // 기존: localStorage.setItem(STORAGE_KEY_TODO_LIST, JSON.stringify(todoList))
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('로컬스토리지 저장 실패:', error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;