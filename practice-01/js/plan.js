"use strict";

// === Данные варианта 3 ===
const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

// === Проверки входных данных ===
let error = null;

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  error = "Ошибка: количество задач должно быть числом.";
} 
else if (!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)) {
  error = "Ошибка: количество задач должно быть конечным числом.";
} 
else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  error = "Ошибка: количество задач должно быть целым числом.";
} 
else if (totalTasks < 0 || completedTasks < 0) {
  error = "Ошибка: количество задач не может быть отрицательным.";
} 
else if (totalTasks > 1000 || completedTasks > 1000) {
  error = "Ошибка: превышена верхняя граница (1000).";
} 
else if (completedTasks > totalTasks) {
  error = "Ошибка: выполнено больше, чем существует.";
} 
else if (typeof dailyLimit !== "number") {
  error = "Ошибка: дневная норма должна быть числом.";
} 
else if (!Number.isFinite(dailyLimit)) {
  error = "Ошибка: дневная норма должна быть конечным числом.";
} 
else if (!Number.isInteger(dailyLimit)) {
  error = "Ошибка: дневная норма должна быть целым числом.";
} 
else if (dailyLimit < 1 || dailyLimit > 1000) {
  error = "Ошибка: дневная норма должна быть в диапазоне 1…1000.";
}

if (error) {
  console.log(error);
} 
else {
  let remaining = totalTasks - completedTasks;

  if (remaining === 0) {
    console.log("Все задачи уже выполнены.");
    console.log("Потребуется дней: 0");
  } 
  else {
    console.log(`Осталось задач: ${remaining}`);

    let day = 0;

    while (remaining > 0) {
      day += 1;
      const doneToday = Math.min(dailyLimit, remaining);
      remaining -= doneToday;
      console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}

