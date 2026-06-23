import TodoApp from '@/app/todos/components/TodoApp'

type Todo = {
  id: number
  text: string
  isDone: boolean
  date: string
}
async function TodosPage(){
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/`, { cache: 'no-store' })
    const todos : Todo[] = await res.json()

    return <TodoApp initialTodos={todos} />

    
        
    


    
}
export default TodosPage