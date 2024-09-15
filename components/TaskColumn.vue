<template>
  <div class="task-column" @dragover.prevent @drop="onDrop">
    <h2>{{ title }}</h2>
    <div class="tasks">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        draggable="true"
        @dragstart="(event) => onDragStart(event, task)"
        :data-testid="'task-card-' + task.id"
      >
        <div v-if="editingTaskId === task.id">
          <input v-model="editedTask.title" placeholder="Title" />
          <textarea
            v-model="editedTask.description"
            placeholder="Description"
          ></textarea>
          <input v-model="editedTask.assignee" placeholder="Assignee" />
          <input
            v-model="executorsAsString"
            placeholder="Executors (comma-separated)"
            @input="onExecutorsInput($event, 'edit')"
          />
          <select v-model="editedTask.status">
            <option value="TODO">TODO</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select v-model.number="editedTask.priority">
            <option :value="1">High</option>
            <option :value="2">Medium</option>
            <option :value="3">Low</option>
          </select>
          <button @click="saveTask(task.id)">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
        <div v-else  class="task-card__wrapper">
          <p><strong>{{ task.title }}</strong></p>
          <p>{{ task.description }}</p>
          <p>Assignee: {{ task.assignee }}</p>
          <p>Executors: {{ task.executors.join(", ") }}</p>
          <label>Status:</label>
          <select v-model="task.status" @change="updateTaskStatus(task)">
            <option value="TODO">TODO</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <label>Priority:</label>
          <select v-model.number="task.priority" @change="updateTaskPriority(task)">
            <option :value="1">High</option>
            <option :value="2">Medium</option>
            <option :value="3">Low</option>
          </select>
          <button @click="editTask(task)">Edit</button>
          <button @click="deleteTask(task.id)">Delete</button>
        </div>
      </div>
    </div>
    <button @click="openAddTaskModal">Add a card</button>

    <div v-if="isAddingTask" class="modal" data-testid="add-task-modal">
      <h3>Add New Task</h3>
      <input v-model="newTask.title" placeholder="Title" />
      <textarea
        v-model="newTask.description"
        placeholder="Description"
      ></textarea>
      <input v-model="newTask.assignee" placeholder="Assignee" />
      <input
        v-model="executorsAsStringNew"
        placeholder="Executors (comma-separated)"
        @input="onExecutorsInput($event, 'new')"
      />
      <select v-model="newTask.status">
        <option value="TODO">TODO</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
      <select v-model.number="newTask.priority">
        <option :value="1">High</option>
        <option :value="2">Medium</option>
        <option :value="3">Low</option>
      </select>
      <button @click="addTask">Add Task</button>
      <button @click="cancelAddTask">Cancel</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import type { Task } from "../store/taskStore";
import { useTaskStore } from "../store/taskStore";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    tasks: {
      type: Array as () => Task[],
      required: true,
    },
  },
  emits: ["task-dropped"],
  setup(props, { emit }) {
    const taskStore = useTaskStore();
    const editingTaskId = ref<number | null>(null);
    const editedTask = ref<Partial<Task>>({
      executors: [],
      priority: 2,
    });
    const isAddingTask = ref(false);
    const newTask = ref<Partial<Task>>({
      title: "",
      description: "",
      assignee: "",
      executors: [],
      status: props.title as Task["status"],
      priority: 2,
    });

    const executorsAsString = computed({
      get: () => (editedTask.value.executors || []).join(", "),
      set: (value: string) => {
        editedTask.value.executors = value.split(",").map((e) => e.trim());
      },
    });

    const executorsAsStringNew = computed({
      get: () => (newTask.value.executors || []).join(", "),
      set: (value: string) => {
        newTask.value.executors = value.split(",").map((e) => e.trim());
      },
    });

    const displayPriority = (priority: number): string => {
      return priority === 1 ? "High" : priority === 2 ? "Medium" : "Low";
    };

    const addTask = () => {
      if (!newTask.value.title || !newTask.value.description) {
        alert("Please fill in all fields.");
        return;
      }
      const task: Task = {
        id: Date.now(),
        title: newTask.value.title!,
        description: newTask.value.description!,
        assignee: newTask.value.assignee!,
        executors: newTask.value.executors || [],
        status: newTask.value.status as Task["status"],
        priority: newTask.value.priority as 1 | 2 | 3,
      };
      taskStore.addTask(task);
      isAddingTask.value = false;
      resetNewTask();
    };

    const deleteTask = (taskId: number) => {
      taskStore.deleteTask(taskId);
    };

    const editTask = (task: Task) => {
      editingTaskId.value = task.id;
      editedTask.value = { ...task, executors: [...task.executors] };
    };

    const saveTask = (taskId: number) => {
      if (editedTask.value) {
        taskStore.updateTask(taskId, {
          ...editedTask.value,
          executors: editedTask.value.executors || [],
        });
      }
      editingTaskId.value = null;
      editedTask.value = {};
    };

    const cancelEdit = () => {
      editingTaskId.value = null;
      editedTask.value = {};
    };

    const updateTaskStatus = (task: Task) => {
      taskStore.updateTaskStatus(task.id, task.status);
    };

    const updateTaskPriority = (task: Task) => {
      taskStore.updateTask(task.id, { priority: task.priority });
    };

    const onDragStart = (event: DragEvent, task: Task) => {
      if (event && task) {
        event.dataTransfer?.setData("taskId", task.id.toString());
      }
    };

    const onDrop = (event: DragEvent) => {
      const taskId = Number(event.dataTransfer?.getData("taskId"));
      if (!isNaN(taskId)) {
        emit("task-dropped", taskId, props.title as Task["status"]);
      }
    };

    const openAddTaskModal = () => {
      isAddingTask.value = true;
    };

    const cancelAddTask = () => {
      isAddingTask.value = false;
      resetNewTask();
    };

    const resetNewTask = () => {
      newTask.value = {
        title: "",
        description: "",
        assignee: "",
        executors: [],
        status: props.title as Task["status"],
        priority: 2,
      };
    };

    const onExecutorsInput = (event: Event, type: "edit" | "new") => {
      const task = type === "edit" ? editedTask : newTask;
      const value = (event.target as HTMLInputElement).value;
      task.value.executors = value.split(",").map((e) => e.trim());
    };

    return {
      addTask,
      deleteTask,
      editTask,
      saveTask,
      cancelEdit,
      updateTaskStatus,
      updateTaskPriority,
      onDragStart,
      onDrop,
      openAddTaskModal,
      cancelAddTask,
      isAddingTask,
      newTask,
      editingTaskId,
      editedTask,
      executorsAsString,
      executorsAsStringNew,
      displayPriority,
      onExecutorsInput,
    };
  },
});
</script>

<style scoped>
.task-column {
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 1rem auto;
}

.tasks {
  margin-top: 1rem;
}

.task-card {
  background-color: #ffffff;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
}
.task-card__wrapper {
  display: flex;
  flex-direction: column;
}
.task-card p {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.task-card select,
.task-card input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.task-card button {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.75rem;
}

.task-card button:hover {
  background-color: #0056b3;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 100%;
  max-width: 450px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #333;
  text-align: center;
}

.modal input,
.modal textarea,
.modal select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.modal input:focus,
.modal textarea:focus,
.modal select:focus {
  border-color: #007bff;
  outline: none;
}

.modal button {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.modal button:hover {
  background-color: #0056b3;
}

.modal .cancel-button {
  background-color: #6c757d;
}

.modal .cancel-button:hover {
  background-color: #5a6268;
}


.task-input,
.task-textarea,
.task-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.task-button {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.task-button:hover {
  background-color: #218838;
}

.add-task-button {
  background-color: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.add-task-button:hover {
  background-color: #16a34a;
}

</style>
