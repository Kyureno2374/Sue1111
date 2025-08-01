const http = require('http')

// Тестирование API лобби
function testLobbyAPI() {
  console.log('🎮 Тестирование API лобби...')
  
  // Тест GET запроса
  const getOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/games/lobby',
    method: 'GET'
  }

  const getReq = http.request(getOptions, (res) => {
    console.log('✅ GET /api/games/lobby - Статус:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const games = JSON.parse(data)
        console.log('📋 Найдено игр в лобби:', games.length)
        console.log('🎯 Первая игра:', games[0] || 'Нет игр')
      } catch (error) {
        console.log('📄 Ответ сервера:', data)
      }
    })
  })

  getReq.on('error', (err) => {
    console.error('❌ Ошибка GET запроса:', err.message)
  })

  getReq.end()

  // Тест POST запроса (создание игры)
  setTimeout(() => {
    console.log('\n🎲 Тестирование создания игры...')
    
    const postData = JSON.stringify({
      userId: 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3', // ID админа
      betAmount: 50
    })

    const postOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/games/lobby',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const postReq = http.request(postOptions, (res) => {
      console.log('✅ POST /api/games/lobby - Статус:', res.statusCode)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          console.log('🎯 Результат создания игры:', result)
        } catch (error) {
          console.log('📄 Ответ сервера:', data)
        }
      })
    })

    postReq.on('error', (err) => {
      console.error('❌ Ошибка POST запроса:', err.message)
    })

    postReq.write(postData)
    postReq.end()
  }, 1000)
}

// Запускаем тест
testLobbyAPI() 