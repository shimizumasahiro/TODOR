export interface Todo {
    id: number;
    text: string;
    completed: boolean;
  }

export interface TodoListProps {
    todos: Todo[];
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
    startEdit: (todo: Todo) => void;
    editTodo: Todo | null;
    saveTodo: (id: number, updatedText: string) => void;
    cancelEdit: () => void;
}

export interface TodoFormProps {
    addTodo: (text: string) => void;
}

export interface TodoItemProps {
    todo: Todo;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
}

export {};