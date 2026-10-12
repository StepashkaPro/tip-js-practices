import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask, findTaskById, getPendingTasks, getTaskTitles, getTaskStats,
  addTask, setTaskCompleted, renameTask, removeTask,
} from "./task-service.js";

console.log("ПР2. Заготовка демонстрационного сценария");
console.log("Количество задач в общем наборе:", demoTasks.length);
console.log("Номер варианта:", variantNumber);
console.log("Количество задач в индивидуальном наборе:", variantTasks.length);

function printStats(tasks, label) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`\n${label}`);
  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } 
  else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function printTasks(tasks, label) {
  console.log(`\n${label}`);
  for (const task of tasks) {
    const mark = task.completed ? "[x]" : "[ ]";
    console.log(`${mark} id ${task.id} — ${task.title} (${task.priority})`);
  }
}



console.log("=== Общий демонстрационный сценарий ===");

let currentTasks = demoTasks;

printTasks(currentTasks, "Исходные задачи:");
console.log(`Названия: ${getTaskTitles(currentTasks).join(", ")}`);
console.log(`Невыполненные id: [${getPendingTasks(currentTasks).map((t) => t.id).join(", ")}]`);
printStats(currentTasks, "Исходная сводка:");

const added = addTask(currentTasks, 20, "Добавить проверку", "high");
if (added.ok) {
  currentTasks = added.tasks;
  console.log("\nДобавлена задача id 20");
} 
else {
  console.error(`Ошибка: ${added.error}`);
}
printStats(currentTasks, "После добавления id 20:");

const completedResult = setTaskCompleted(currentTasks, 4, true);
if (completedResult.ok) {
  currentTasks = completedResult.tasks;
  console.log("\nЗадача id 4 выполнена");
} 
else {
  console.error(`Ошибка: ${completedResult.error}`);
}
printStats(currentTasks, "После выполнения id 4:");

const renamed = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (renamed.ok) {
  currentTasks = renamed.tasks;
  console.log("\nЗадача id 10 переименована");
} 
else {
  console.error(`Ошибка: ${renamed.error}`);
}
printStats(currentTasks, "После переименования id 10:");

const removed = removeTask(currentTasks, 7);
if (removed.ok) {
  currentTasks = removed.tasks;
  console.log("\nЗадача id 7 удалена");
} 
else {
  console.error(`Ошибка: ${removed.error}`);
}
printStats(currentTasks, "После удаления id 7:");

const duplicate = addTask(currentTasks, 20, "Дубликат");
if (!duplicate.ok) {
  console.log(`\nПоказанная ошибка: ${duplicate.error}`);
  console.log("Состояние не изменено");
}
printStats(currentTasks, "После отказа:");

console.log(`\nИтоговые идентификаторы: [${currentTasks.map((t) => t.id).join(", ")}]`);

const demoIds = demoTasks.map((t) => t.id).join(", ");
console.log(`demoTasks сохранён: [${demoIds}], длина ${demoTasks.length}`);