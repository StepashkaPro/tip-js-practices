// 1
function sum(a, b) {
  return a + b;
}
console.log("1:", sum(2, 3));
console.log("1:", sum("2", 3));
console.log("1:", typeof sum(2, 3), typeof sum("2", 3));

// 2
const square = (value) => {
  return value * value;
};
console.log("2:", square(4));

// 3
const original = { title: "Черновик", published: false };
const alias = original;
alias.published = true;
console.log("3:", original.published);
console.log("3:", original === alias);

// 4
const books = [
  { id: 12, title: "JavaScript" },
  { id: 35, title: "HTTP" },
];
const booksCopy = [...books];
booksCopy[0].title = "Изменено";
console.log("4:", books[0].title);
console.log("4:", books === booksCopy);
console.log("4:", books[0] === booksCopy[0]);

// 5
const oldBook = { id: 12, title: "Черновик", available: false };
const newBookA = { ...oldBook, available: true };
const newBookB = { available: true, ...oldBook };
console.log("5:", newBookA.available);
console.log("5:", newBookB.available);
console.log("5:", oldBook.available);

// 6
function makeCaption(text = "Без названия") {
  return text;
}
console.log("6:", makeCaption());
console.log("6:", makeCaption(undefined));
console.log("6:", makeCaption(null));
console.log("6:", makeCaption(""));