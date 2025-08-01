const http = require('http')

// Тестирование базы данных
function testDatabase() {
  console.log('🗄️ Тестирование базы данных...')
  
  // Проверяем, что игра существует
  const gameId = '750f1f0a-e5be-44b2-9f6c-5427e68754ec' // ID из предыдущего теста
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/games/${gameId}`,
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    console.log('📊 Статус получения игры:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log('📄 Ответ сервера:', data)
      
      try {
        const result = JSON.parse(data)
        console.log('✅ Игра найдена:', result)
      } catch (error) {
        console.error('❌ Ошибка парсинга:', error)
      }
    })
  })

  req.on('error', (err) => {
    console.error('❌ Ошибка запроса:', err.message)
  })

  req.end()
}

// Запускаем тест
testDatabase() 