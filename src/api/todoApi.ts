import axios from 'axios';
import { Todo, NewTodo } from '../types/todo';

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

export const todoApi = {
  getTodos: async (): Promise<Todo[]> => {
    try {
      const response = await axios.get<Todo[]>(API_URL);
      // Limit to first 20 items and sort by ID
      return response.data
        .slice(0, 20)
        .sort((a, b) => a.id - b.id);
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
  },

  // Simulated POST request (JSONPlaceholder doesn't actually save)
  createTodo: async (newTodo: NewTodo): Promise<Todo> => {
    try {
      const response = await axios.post<Todo>(API_URL, newTodo);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
  },

  // Simulated PUT request
  updateTodo: async (id: number, updates: Partial<Todo>): Promise<Todo> => {
    try {
      const response = await axios.put<Todo>(`${API_URL}/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new Error('Failed to update todo');
    }
  },

  // Simulated DELETE request
  deleteTodo: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw new Error('Failed to delete todo');
    }
  }
}; 