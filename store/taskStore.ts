import { defineStore } from 'pinia';
import { isClient } from '@vueuse/core';

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  executors: string[];
  status: 'TODO' | 'In Progress' | 'Done';
  priority: number;
}

interface TaskState {
  tasks: Task[];
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
  }),
  actions: {
    initializeTasks() {
      if (isClient) {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          this.tasks = JSON.parse(storedTasks);
        }
      }
    },
    addTask(task: Task) {
      this.tasks.push(task);
      this.saveTasksToLocalStorage();
    },
    updateTaskStatus(taskId: number, newStatus: Task['status']) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
        this.saveTasksToLocalStorage();
      }
    },
    deleteTask(taskId: number) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId);
      this.saveTasksToLocalStorage();
    },
    updateTaskTitle(taskId: number, newTitle: string) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.title = newTitle;
        this.saveTasksToLocalStorage();
      }
    },
    updateTask(taskId: number, updatedTask: Partial<Task>) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, updatedTask);
        this.saveTasksToLocalStorage();
      }
    },
    saveTasksToLocalStorage() {
      if (isClient) {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
      }
    },
  },
});
