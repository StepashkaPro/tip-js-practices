"use strict";

const totalTasks = 5;
const completedTasks = 0;

let error = null;

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  error = "Ошибка: количество задач должно быть числом.";
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

if (error) {
  console.log(error);
} 
else if (totalTasks === 0 && completedTasks === 0) {
  console.log("Задач пока нет.");
} 

else {
  let status;
  if (completedTasks === 0) {
    status = "Не начато";
  } 
  else if (completedTasks === totalTasks) {
    status = "Завершено";
  } 
  else {
    status = "В работе";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${totalTasks - completedTasks}`);
  console.log(`Прогресс: ${(completedTasks / totalTasks * 100).toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
