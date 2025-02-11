import { useState, useEffect } from 'react';
import { Todo } from '../types/todo';
import { todoApi } from '../api/todoApi';

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial todos
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiTodos = await todoApi.getTodos();
        setTodos(apiTodos);
      } catch (err) {
        setError('Failed to load todos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim() || isSubmitting) return;

    const newTodo: Todo = {
      id: Date.now(), // Temporary ID
      title: newTodoTitle.trim(),
      completed: false,
      userId: 1,
    };

    try {
      setIsSubmitting(true);
      // Optimistic update
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoTitle('');

      // Attempt API call (will fail silently as it's a mock API)
      await todoApi.createTodo({
        title: newTodo.title,
        completed: newTodo.completed,
        userId: newTodo.userId
      });
    } catch (err) {
      // Revert on error
      setTodos(prev => prev.filter(todo => todo.id !== newTodo.id));
      setError('Failed to add todo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    const todoToUpdate = todos.find(t => t.id === id);
    if (!todoToUpdate) return;

    try {
      // Optimistic update
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));

      // API call (will fail silently)
      await todoApi.updateTodo(id, { completed: !todoToUpdate.completed });
    } catch (err) {
      // Revert on error
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: todoToUpdate.completed } : todo
      ));
      setError('Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    try {
      // Optimistic update
      setTodos(prev => prev.filter(todo => todo.id !== id));

      // API call (will fail silently)
      await todoApi.deleteTodo(id);
    } catch (err) {
      // Revert on error
      setTodos(prev => [...prev, todoToDelete]);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 text-red-500 p-4 rounded-lg shadow-lg">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Todo List
      </h1>
      
      <form onSubmit={handleAddTodo} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Todo
          </button>
        </div>
      </form>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Your Todos</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          {filteredTodos.length > 0 ? (
            <ul className="space-y-3">
              {filteredTodos.map((todo) => (
                <li 
                  key={todo.id} 
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className={`flex-1 text-gray-700 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                    {todo.title}
                  </span>
                  <button 
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    aria-label="Delete todo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {filter === 'all' 
                  ? 'No todos yet. Add one above!' 
                  : `No ${filter} todos found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Total: {todos.length} todos</p>
        <p>Completed: {todos.filter(t => t.completed).length} todos</p>
      </div>
    </div>
  );
};

export default TodoList; 