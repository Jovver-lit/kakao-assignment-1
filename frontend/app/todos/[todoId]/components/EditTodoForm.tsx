"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export default function EditTodoForm({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [title, setTitle] = useState(todo.title);
  const [completed, setCompleted] = useState(todo.completed);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), completed }),
      });
      if (!res.ok) throw new Error("Todo 수정에 실패했습니다.");
      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${todo.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Todo 삭제에 실패했습니다.");
      router.push("/todos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: "#5b35c5" }}>
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#c4b5fd" } as React.CSSProperties}
        />
        {error && <p className="text-red-400 text-sm mt-1 pl-2">{error}</p>}
      </div>

      <div
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
        style={{ backgroundColor: "#f5f3ff" }}
        onClick={() => setCompleted(!completed)}
      >
        <span
          className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors"
          style={{
            backgroundColor: completed ? "#5b35c5" : "transparent",
            borderColor: completed ? "#5b35c5" : "#c4b5fd",
          }}
        />
        <span className="text-sm" style={{ color: "#5b35c5" }}>
          완료됨
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 text-white py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: "#5b35c5" }}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2 rounded-full text-sm font-medium transition-colors"
          style={{ backgroundColor: "#ede9f6", color: "#5b35c5" }}
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="py-2 px-4 rounded-full text-sm font-medium border border-red-200 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </form>
  );
}