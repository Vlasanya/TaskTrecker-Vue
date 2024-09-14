<template>
  <header class="app-header">
    <div class="logo">
      <h1>Task Tracker</h1>
    </div>
    <div class="actions">
      <button @click="addExampleTask" class="add-task-button">
        Add Example Task
      </button>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTaskStore } from "../store/taskStore";

export default defineComponent({
  name: "Header",
  setup() {
    const taskStore = useTaskStore();

    const addExampleTask = () => {
      taskStore.addTask({
        id: Date.now(),
        title: "Example Task",
        description: "This is an example task",
        assignee: "User",
        executors: ["User1", "User2"],
        status: "TODO",
        priority: 1,
      });
    };

    return {
      addExampleTask,
    };
  },
});
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #1f2937;
  color: white;
  border-bottom: 1px solid #e5e7eb;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
}

.actions .add-task-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: 0.2s;
}

.actions .add-task-button:hover {
  background-color: #2563eb;
}
</style>
