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

// Тестируем доску из логов пользователя
const board1 = ["X", null, "O", "X", null, null, null, null, "O"];
console.log("Board 1:", board1);
console.log("Winner 1:", calculateWinner(board1));

// Тестируем доску с выигрышной комбинацией X в первом столбце
const board2 = ["X", null, "O", "X", null, null, "X", null, "O"];
console.log("Board 2:", board2);
console.log("Winner 2:", calculateWinner(board2));

// Проверяем все линии для board2
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтали
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикали
  [0, 4, 8], [2, 4, 6] // диагонали
];

console.log("\nChecking all lines for board2:");
for (const [a, b, c] of lines) {
  console.log(`Line [${a}, ${b}, ${c}]: ${board2[a]}, ${board2[b]}, ${board2[c]}`);
  if (board2[a] && board2[a] === board2[b] && board2[a] === board2[c]) {
    console.log(`Winner found in line [${a}, ${b}, ${c}]: ${board2[a]}`);
  }
} 