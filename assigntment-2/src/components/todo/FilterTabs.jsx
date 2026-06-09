// FilterTabs
// 기존: <nav class="filter-tabs"> HTML 하드코딩
//       handleFilterChange(filter) + updateFilterTabStyles() 전역 함수
//       filterTabButtons.forEach(tab => addEventListener('click', ...))
// 변경: currentFilter를 props로 받아 조건부 className 적용, 클릭 시 onFilterChange 콜백 호출

const FILTER_OPTIONS = [
  { value: 'all',    label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'done',   label: '완료' },
];

/**
 * FilterTabs
 * 전체 / 진행 중 / 완료 필터 탭 UI
 * @param {string}   currentFilter  - 현재 선택된 필터 값
 * @param {Function} onFilterChange - 탭 클릭 시 호출되는 콜백 (filter 값을 인자로 전달)
 */
function FilterTabs({ currentFilter, onFilterChange }) {
  return (
    // 기존: filterTabButtons.forEach로 is-active 클래스 수동 토글
    // 변경: map()으로 렌더링, currentFilter 비교로 is-active 자동 적용
    <nav className="filter-tabs">
      {FILTER_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          className={`filter-tab${currentFilter === value ? ' is-active' : ''}`}
          onClick={() => onFilterChange(value)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

export default FilterTabs;