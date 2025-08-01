// Отладка мультиплеера
console.log('🔍 Отладка мультиплеера...')

// Проверяем, что происходит при создании игры
async function testCreateGame() {
  console.log('🎮 Тестирование создания игры...')
  
  try {
    const response = await fetch('/api/games/lobby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3', // ID админа
        betAmount: 50
      })
    })

    console.log('📊 Статус ответа:', response.status)
    console.log('📋 Заголовки:', response.headers)

    const data = await response.text()
    console.log('📄 Ответ сервера:', data)

    try {
      const jsonData = JSON.parse(data)
      console.log('✅ JSON ответ:', jsonData)
      
      if (jsonData.success) {
        console.log('🎯 Игра создана успешно!')
        console.log('🆔 ID игры:', jsonData.game.id)
        return jsonData.game.id
      } else {
        console.error('❌ Ошибка создания игры:', jsonData.error)
      }
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError)
      console.log('📄 Сырой ответ:', data)
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error)
  }
}

// Проверяем статус игры
async function testGameStatus(gameId) {
  console.log('🔍 Проверка статуса игры:', gameId)
  
  try {
    const response = await fetch(`/api/games/${gameId}`)
    console.log('📊 Статус ответа:', response.status)
    
    const data = await response.text()
    console.log('📄 Ответ сервера:', data)
    
    try {
      const jsonData = JSON.parse(data)
      console.log('✅ JSON ответ:', jsonData)
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError)
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error)
  }
}

// Проверяем подключение ИИ
async function testJoinAI(gameId) {
  console.log('🤖 Тестирование подключения ИИ к игре:', gameId)
  
  try {
    const response = await fetch(`/api/games/${gameId}/join-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'f3c1999b-c49c-4720-aad4-6ba9c7caf8b3'
      })
    })

    console.log('📊 Статус ответа:', response.status)
    
    const data = await response.text()
    console.log('📄 Ответ сервера:', data)
    
    try {
      const jsonData = JSON.parse(data)
      console.log('✅ JSON ответ:', jsonData)
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError)
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error)
  }
}

// Запускаем тесты
async function runTests() {
  console.log('🚀 Запуск тестов мультиплеера...')
  
  const gameId = await testCreateGame()
  
  if (gameId) {
    await testGameStatus(gameId)
    await testJoinAI(gameId)
  }
}

// Экспортируем функции для использования в консоли браузера
window.testMultiplayer = {
  testCreateGame,
  testGameStatus,
  testJoinAI,
  runTests
}

console.log('✅ Функции отладки загружены. Используйте:')
console.log('  - window.testMultiplayer.runTests() - запустить все тесты')
console.log('  - window.testMultiplayer.testCreateGame() - создать игру')
console.log('  - window.testMultiplayer.testGameStatus(gameId) - проверить статус')
console.log('  - window.testMultiplayer.testJoinAI(gameId) - подключить ИИ') 