'use client'
 
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
 
type Todo = {
  id: number
  text: string
  isDone: boolean
  date: string
}
 
const API = process.env.NEXT_PUBLIC_API_URL
 
export default function EditTodoPage() {
  const router          = useRouter()
  const params          = useParams()
  const todoId          = params.todoId as string
 
  const [todo, setTodo]     = useState<Todo | null>(null)
  const [text, setText]     = useState('')
  const [isError, setIsError] = useState(false)
 
  // 페이지 진입 시 해당 Todo 데이터를 불러옴
  useEffect(() => {
    fetch(`${API}/todos/`)
      .then((r) => r.json())
      .then((todos: Todo[]) => {
        const found = todos.find((t) => t.id === Number(todoId))
        if (found) { setTodo(found); setText(found.text) }
      })
  }, [todoId])
 
  const handleSave = async () => {
    const trimmed = text.trim()
    if (!trimmed) { setIsError(true); return }
 
    await fetch(`${API}/todos/${todoId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text: trimmed }),
    })
 
    router.push('/todos')
    router.refresh()
  }
 
  const handleDelete = async () => {
    await fetch(`${API}/todos/${todoId}`, { method: 'DELETE' })
    router.push('/todos')
    router.refresh()
  }
 
  if (!todo) return <p style={{ padding: '48px', textAlign: 'center' }}>불러오는 중...</p>
 
  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1 className="app-title">할 일 수정</h1>
      </header>
 
      <section className="input-section">
        <div className="input-row">
          <input
            type="text"
            className={`todo-input${isError ? ' is-error' : ''}`}
            maxLength={100}
            value={text}
            autoFocus
            onChange={(e) => { setText(e.target.value); setIsError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button className="btn btn-add" onClick={handleSave}>저장</button>
        </div>
        {isError && <p className="error-message">할 일을 입력해주세요.</p>}
      </section>
 
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button className="btn-action btn-delete" onClick={handleDelete}>
          ✕ 삭제
        </button>
        <button className="btn-action btn-edit" onClick={() => router.back()}>
          ← 돌아가기
        </button>
      </div>
    </div>
  )
}