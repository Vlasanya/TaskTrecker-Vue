<template>
  <div>
    <Header />

    <div class="task-board">
      <TaskColumn title="TODO" :tasks="todoTasks" @task-dropped="moveTask" />
      <TaskColumn title="In Progress" :tasks="inProgressTasks" @task-dropped="moveTask" />
      <TaskColumn title="Done" :tasks="doneTasks" @task-dropped="moveTask" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskStore } from '../store/taskStore';
import TaskColumn from './TaskColumn.vue';
import Header from './Header.vue';
import { computed, onMounted } from 'vue';
import type { Task } from '../store/taskStore';

const taskStore = useTaskStore();

onMounted(() => {
  taskStore.initializeTasks();
});

const todoTasks = computed(() => taskStore.tasks.filter(task => task.status === 'TODO'));
const inProgressTasks = computed(() => taskStore.tasks.filter(task => task.status === 'In Progress'));
const doneTasks = computed(() => taskStore.tasks.filter(task => task.status === 'Done'));

const moveTask = (taskId: number, newStatus: Task['status']) => {
  taskStore.updateTaskStatus(taskId, newStatus);
};
</script>

<style scoped>
.task-board {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f4f5f7;
  border-radius: 0.5rem;
  overflow-x: auto;
}
</style>
