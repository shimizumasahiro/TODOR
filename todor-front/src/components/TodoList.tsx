import React, { useState } from 'react';
import TodoItem from './TodoItem';
import { TodoListProps } from '../types/todo';

const TodoList: React.FC<TodoListProps> = ({ todos, toggleTodo, deleteTodo, startEdit, editTodo, saveTodo, cancelEdit }) => {
  const [editText, setEditText] = useState('');
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {editTodo && editTodo.id === todo.id ? (
            <div>
              <input 
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <button onClick={() => saveTodo(todo.id, editText)}>Save</button>
              <button onClick={cancelEdit}>cancel</button>
            </div>
          ) : (
            <div>
              <span
                style={{textDecoration: todo.completed ? 'line-through' : 'none'}}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.text}
              </span>
              <button onClick={() => startEdit(todo)}>Edit</button>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
  
  export default TodoList;