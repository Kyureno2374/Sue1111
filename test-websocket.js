const io = require('socket.io-client')

// Тестирование WebSocket соединения
async function testWebSocket() {
  console.log('🔌 Тестирование WebSocket соединения...')
  
  const socket = io('http://localhost:3000', {
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('✅ Подключение к WebSocket серверу успешно!')
    console.log('Socket ID:', socket.id)
    
    // Тестируем ping/pong
    socket.emit('ping')
  })

  socket.on('pong', () => {
    console.log('✅ Ping/Pong работает!')
  })

  socket.on('connect_error', (error) => {
    console.error('❌ Ошибка подключения к WebSocket:', error.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('🔌 Отключение от WebSocket:', reason)
  })

  // Тестируем создание игры
  setTimeout(() => {
    console.log('🎮 Тестирование создания игры...')
    socket.emit('game:join', {
      gameId: 'test-game-123',
      userId: 'test-user-1',
      username: 'TestPlayer1'
    })
  }, 1000)

  socket.on('game:player_joined', (data) => {
    console.log('✅ Игрок присоединился к игре:', data)
  })

  socket.on('game:error', (error) => {
    console.error('❌ Ошибка игры:', error)
  })

  // Завершаем тест через 5 секунд
  setTimeout(() => {
    console.log('🏁 Завершение теста...')
    socket.disconnect()
    process.exit(0)
  }, 5000)
}

// Запускаем тест
testWebSocket().catch(console.error) 