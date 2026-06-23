"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type Todo = {
  id: number;
  text: string;
  isDone: boolean;
  date: string | null;
};

type Filter = "all" | "active" | "completed";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DAY_KO = ["월", "화", "수", "목", "금", "토", "일"];
const FILTER_LABELS: Record<Filter, string> = {
  all: "전체",
  active: "진행 중",
  completed: "완료",
};

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export default function TodoApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = (searchParams.get("filter") ?? "all") as Filter;
  const search = searchParams.get("search") ?? "";

  // 입력창 로컬 상태 (URL과 별도로 즉시 반응)
  const [searchInput, setSearchInput] = useState(search);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  // 최신 searchParams를 항상 참조하기 위한 ref (디바운스 클로저 문제 방지)
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const weekDates = getWeekDates(weekStart);
  const weekRangeStr = `${toISODate(weekDates[0])} ~ ${toISODate(weekDates[6])}`;

  const fetchTodos = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/todos?${params.toString()}`);
    if (res.ok) setTodos(await res.json());
  }, [filter, search]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 검색어 입력 후 300ms 디바운스 → URL 업데이트 (history 오염 방지에 replace 사용)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTodos = todos.filter((t) => {
  if (t.date !== selectedDate) return false
  if (filter === 'active'    && t.isDone)  return false
  if (filter === 'completed' && !t.isDone) return false
  if (searchInput && !t.text.toLowerCase().includes(searchInput.toLowerCase())) return false
  return true
})

  function countForDate(date: Date) {
    return todos.filter((t) => t.date === toISODate(date)).length;
  }

  // 필터 탭 클릭 → URL 업데이트 (search 파라미터 유지)
  function handleFilterChange(f: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "all") {
      params.delete("filter");
    } else {
      params.set("filter", f);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleAdd() {
    const title = input.trim();
    if (!title) return;
    await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: title, isDone: false, date: selectedDate }),
    });
    setInput("");
    fetchTodos();
  }

  async function handleToggle(todo: Todo) {
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: !todo.isDone }),
    });
    fetchTodos();
  }

  async function handleDelete(id: number) {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  }

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#ede9f6" }}
    >
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-lg">
        {/* 제목 */}
        <h1
          className="text-3xl font-bold italic text-center mb-6"
          style={{ color: "#5b35c5" }}
        >
          Todo List
        </h1>

        {/* 주 탐색 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevWeek}
            className="text-lg font-bold transition-opacity hover:opacity-60"
            style={{ color: "#5b35c5" }}
          >
            ◀
          </button>
          <span className="text-sm text-gray-400">{weekRangeStr}</span>
          <button
            onClick={nextWeek}
            className="text-lg font-bold transition-opacity hover:opacity-60"
            style={{ color: "#5b35c5" }}
          >
            ▶
          </button>
        </div>

        {/* 요일 선택 */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {weekDates.map((date, i) => {
            const iso = toISODate(date);
            const isSelected = iso === selectedDate;
            const count = countForDate(date);
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className="flex flex-col items-center py-2 px-1 rounded-2xl transition-colors"
                style={{
                  backgroundColor: isSelected ? "#5b35c5" : "#ede9f6",
                  color: isSelected ? "#ffffff" : "#5b35c5",
                }}
              >
                <span className="text-xs mb-1">{DAY_KO[i]}</span>
                <span className="text-lg font-bold leading-tight">
                  {date.getDate()}
                </span>
                <span className="text-xs mt-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Todo 추가 입력창 */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="할 일을 입력하세요"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#c4b5fd" } as React.CSSProperties}
          />
          <button
            onClick={handleAdd}
            className="text-white px-5 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#5b35c5" }}
          >
            추가
          </button>
        </div>

        {/* 검색창 */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
            🔍
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="w-full border border-gray-200 rounded-full pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#c4b5fd" } as React.CSSProperties}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: filter === f ? "#5b35c5" : "#ede9f6",
                color: filter === f ? "#ffffff" : "#5b35c5",
              }}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Todo 목록 */}
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            {search
              ? `"${search}"에 해당하는 Todo가 없습니다.`
              : "할 일이 없습니다. 추가해보세요!"}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: "#f5f3ff" }}
              >
                <button
                  onClick={() => handleToggle(todo)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: todo.isDone ? "#5b35c5" : "transparent",
                    borderColor: todo.isDone ? "#5b35c5" : "#c4b5fd",
                  }}
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.isDone
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/todos/${todo.id}`}
                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs transition-colors hover:opacity-80"
                    style={{ backgroundColor: "#ede9f6", color: "#5b35c5" }}
                  >
                    ✏
                  </Link>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-colors hover:opacity-80"
                    style={{ backgroundColor: "#fce7f3", color: "#e11d48" }}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
