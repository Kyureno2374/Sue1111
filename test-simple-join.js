const http = require('http')

// Простой тест для API join-ai
async function testSimpleJoin() {
  console.log('🤖 Простой тест API join-ai...')
  
  // Используем существующую игру
  const gameId = '8e097510-d6f8-44bc-9a39-f2b92b43d842' // ID из логов
  
  const joinData = JSON.stringify({
    userId: 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3'
  })

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/games/${gameId}/join-ai`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(joinData)
    }
  }

  const req = http.request(options, (res) => {
    console.log('📊 Статус:', res.statusCode)
    console.log('📋 Заголовки:', res.headers)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log('📄 Ответ:', data)
      
      try {
        const result = JSON.parse(data)
        console.log('✅ JSON ответ:', result)
      } catch (error) {
        console.error('❌ Ошибка парсинга:', error)
      }
    })
  })

  req.on('error', (err) => {
    console.error('❌ Ошибка запроса:', err.message)
  })

  req.write(joinData)
  req.end()
}

// Запускаем тест
testSimpleJoin() 