export function getVisibleTasks(tasks, filter = "all") {
  return tasks.filter((t) =>
    filter === "pending"
      ? !t.completed
      : filter === "completed"
        ? t.completed
        : true,
  );
}
