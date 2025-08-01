const http = require('http')

// Тестирование API join-ai
async function testJoinAI() {
  console.log('🤖 Тестирование API join-ai...')
  
  // Сначала создаем игру
  const createGameData = JSON.stringify({
    userId: 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3',
    betAmount: 50
  })

  const createOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/games/lobby',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(createGameData)
    }
  }

  const createReq = http.request(createOptions, (res) => {
    console.log('📊 Статус создания игры:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data)
        console.log('✅ Игра создана:', result.game.id)
        
        // Теперь тестируем join-ai
        testJoinAIForGame(result.game.id)
      } catch (error) {
        console.error('❌ Ошибка парсинга:', error)
      }
    })
  })

  createReq.on('error', (err) => {
    console.error('❌ Ошибка создания игры:', err.message)
  })

  createReq.write(createGameData)
  createReq.end()
}

function testJoinAIForGame(gameId) {
  console.log('🤖 Подключаем ИИ к игре:', gameId)
  
  const joinData = JSON.stringify({
    userId: 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3'
  })

  const joinOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/games/${gameId}/join-ai`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(joinData)
    }
  }

  const joinReq = http.request(joinOptions, (res) => {
    console.log('📊 Статус подключения ИИ:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log('📄 Ответ сервера:', data)
      
      try {
        const result = JSON.parse(data)
        console.log('✅ ИИ подключен:', result)
      } catch (error) {
        console.error('❌ Ошибка парсинга ответа:', error)
      }
    })
  })

  joinReq.on('error', (err) => {
    console.error('❌ Ошибка подключения ИИ:', err.message)
  })

  joinReq.write(joinData)
  joinReq.end()
}

// Запускаем тест
testJoinAI() 