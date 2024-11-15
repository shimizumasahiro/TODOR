import React, { useEffect, useState } from 'react';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import { Todo } from './types/todo';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  useEffect(() => {
    fetch("http://127.0.0.1:8080/todos")
      .then(response => response.json())
      .then(data => setTodos(data))
      .catch(error => console.error("Error fetching todos: ", error))
  })

  const addTodo = (text: string) => {
    const newTodo = {id: Math.floor(Math.random() * 10000), text, completed: false};
    fetch('http://127.0.0.1:8080/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    })
    .then(response => {
      if (!response.ok) {
        // レスポンスの内容をテキストとしてログに出力
        return response.text().then(text => {
          console.log('Response text:', text);
          throw new Error('Network response was not ok');
        });
      }
      return response.json();
    })
    .then(addedTodo => setTodos([...todos, addedTodo]))
    .catch(error => {
      console.log('Error adding todos:', error);
    });
  };

  const deleteTodo = (id: number) => {
    fetch(`http://127.0.0.1:8080/todos/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setTodos(todos.filter(todo => todo.id !== id));
    })
    .catch(error => {
      console.log('Error deleting todo:', error);
    });
  };
  
  const updateTodo = (id: number, updatedText: string, completed: boolean) => {
    const updatedTodo = { id, text: updatedText, completed };
    fetch(`http://127.0.0.1:8080/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTodo),
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.log('Response text:', text);
          throw new Error('Network response was not ok');
        });
      }
      return response.json();
    })
    .then(() => {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, text: updatedText, completed } : todo
      ));
    })
    .catch(error => {
      console.log('Error updating todo:', error);
    });
  };

  const startEdit = (todo: Todo) => {
    setEditTodo(todo);
  }

  const cancelEdit = () => {
    setEditTodo(null);
  }

  const saveTodo = (id: number, updatedText: string) => {
    if (editTodo) {
      updateTodo(id, updatedText, editTodo.completed);
      setEditTodo(null);
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ToDo List</h1>
        <TodoForm addTodo={addTodo} />
        <TodoList 
          todos={todos} 
          toggleTodo={toggleTodo} 
          deleteTodo={deleteTodo} 
          startEdit={startEdit}
          editTodo={editTodo}
          saveTodo={saveTodo}
          cancelEdit={cancelEdit}
        />
      </header>
    </div>
  );
}

export default App;