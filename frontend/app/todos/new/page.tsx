import NewTodoForm from "./components/NewTodoForm";

export default function NewTodoPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">새 Todo</h1>
      <NewTodoForm />
    </main>
  );
}