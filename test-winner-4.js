function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Тестируем доску из логов
const board = [null, null, null, 'X', 'O', 'O', 'X', 'X', 'O'];
console.log('Board:', board);
console.log('Winner:', calculateWinner(board));

// Проверим все возможные выигрышные комбинации
const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

console.log('\nПроверяем все линии:');
lines.forEach((line, index) => {
  const [a, b, c] = line;
  console.log(`Линия ${index}: [${a},${b},${c}] = [${board[a]}, ${board[b]}, ${board[c]}]`);
}); 