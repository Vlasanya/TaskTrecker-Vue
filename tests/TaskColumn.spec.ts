import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import "@testing-library/jest-dom";
import { render, fireEvent, waitFor, screen } from "@testing-library/vue";
import TaskColumn from "../components/TaskColumn.vue";
import { useTaskStore } from "../store/taskStore";

describe("TaskColumn.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders column title and tasks", () => {
    const wrapper = mount(TaskColumn, {
      props: {
        title: "TODO",
        tasks: [
          {
            id: 1,
            title: "Task 1",
            description: "Desc 1",
            assignee: "User1",
            executors: ["User1"],
            status: "TODO",
            priority: 1,
          },
          {
            id: 2,
            title: "Task 2",
            description: "Desc 2",
            assignee: "User2",
            executors: ["User2"],
            status: "TODO",
            priority: 2,
          },
        ],
      },
    });

    expect(wrapper.find("h2").text()).toBe("TODO");
    expect(wrapper.findAll(".task-card").length).toBe(2);
  });

  it("can change task status and priority", async () => {
    const wrapper = mount(TaskColumn, {
      props: {
        title: "TODO",
        tasks: [
          {
            id: 1,
            title: "Task 1",
            description: "Desc 1",
            assignee: "User1",
            executors: ["User1"],
            status: "TODO",
            priority: 1,
          },
        ],
      },
    });

    const statusSelect = wrapper.find("select").element as HTMLSelectElement;
    statusSelect.value = "In Progress";
    await wrapper.find("select").trigger("change");
    const prioritySelect = wrapper.findAll("select").at(1)
      ?.element as HTMLSelectElement;
    prioritySelect.value = "2";
    await wrapper.findAll("select").at(1)?.trigger("change");

    await waitFor(() => {
      const tasks = (wrapper.vm.$props as { tasks: any[] }).tasks;
      expect(tasks[0].status).toBe("In Progress");
      expect(tasks[0].priority).toBe(2);
    });
  });
});
