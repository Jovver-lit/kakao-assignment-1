"use server";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  date: string | null;
};

const BACKEND_URL = process.env.BACKEND_URL;

export async function getTodo(id: string): Promise<Todo | null> {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Todo를 불러오는 데 실패했습니다.");
  return res.json();
}