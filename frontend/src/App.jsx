import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await axios.get('http://localhost:8000/todos/');
    setTodos(response.data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title) return;
    await axios.post('http://localhost:8000/todos/', { title, description });
    setTitle('');
    setDescription('');
    fetchTodos();
  };

  const updateTodo = async (id, todo) => {
    await axios.put(`http://localhost:8000/todos/${id}`, todo);
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:8000/todos/${id}`);
    fetchTodos();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Todo List</h1>
        <form onSubmit={addTodo} className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Add Todo
          </button>
        </form>
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className={`font-medium ${todo.completed ? 'line-through' : ''}`}>
                  {todo.title}
                </span>
                {todo.description && (
                  <p className="text-sm text-gray-600">{todo.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateTodo(todo.id, { ...todo, completed: !todo.completed })}
                  className="text-green-500 hover:text-green-600"
                >
                  {todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
