export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface NewTodo {
  title: string;
  completed: boolean;
  userId: number;
} 