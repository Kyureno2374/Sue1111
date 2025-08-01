// Тест функции calculateWinner
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  return null
}

// Тестируем доску из последних логов пользователя
const board1 = [null, "X", "O", "X", "O", null, "X", "O", null];
console.log("Board 1:", board1);
console.log("Winner 1:", calculateWinner(board1));

// Проверяем все линии для board1
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтали
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикали
  [0, 4, 8], [2, 4, 6] // диагонали
];

console.log("\nChecking all lines for board1:");
for (const [a, b, c] of lines) {
  console.log(`Line [${a}, ${b}, ${c}]: ${board1[a]}, ${board1[b]}, ${board1[c]}`);
  if (board1[a] && board1[a] === board1[b] && board1[a] === board1[c]) {
    console.log(`Winner found in line [${a}, ${b}, ${c}]: ${board1[a]}`);
  }
}

// Тестируем доску после следующего хода (предполагаем, что игрок X поставит в позицию 0)
const board2 = ["X", "X", "O", "X", "O", null, "X", "O", null];
console.log("\nBoard 2 (after X move to position 0):", board2);
console.log("Winner 2:", calculateWinner(board2));

console.log("\nChecking all lines for board2:");
for (const [a, b, c] of lines) {
  console.log(`Line [${a}, ${b}, ${c}]: ${board2[a]}, ${board2[b]}, ${board2[c]}`);
  if (board2[a] && board2[a] === board2[b] && board2[a] === board2[c]) {
    console.log(`Winner found in line [${a}, ${b}, ${c}]: ${board2[a]}`);
  }
} 