const http = require('http')

// Скрипт для очистки незавершенных игр
async function cleanupGames() {
  console.log('🧹 Очистка незавершенных игр...')
  
  // Сначала получаем список всех игр
  const getOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/games/lobby',
    method: 'GET'
  }

  const getReq = http.request(getOptions, (res) => {
    console.log('📊 Статус получения игр:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const games = JSON.parse(data)
        console.log(`📋 Найдено игр: ${games.length}`)
        
        // Показываем информацию о каждой игре
        games.forEach((game, index) => {
          console.log(`${index + 1}. ID: ${game.id}`)
          console.log(`   Статус: ${game.status}`)
          console.log(`   Ставка: $${game.betAmount}`)
          console.log(`   Создана: ${game.createdAt}`)
          console.log(`   Создатель: ${game.creator?.username || 'Unknown'}`)
          console.log('')
        })
        
        // Предлагаем удалить игры
        if (games.length > 0) {
          console.log('🗑️ Для удаления всех игр нажмите Enter...')
          process.stdin.once('data', () => {
            deleteAllGames(games)
          })
        } else {
          console.log('✅ Нет игр для удаления')
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга:', error)
      }
    })
  })

  getReq.on('error', (err) => {
    console.error('❌ Ошибка получения игр:', err.message)
  })

  getReq.end()
}

// Удаляем все игры
function deleteAllGames(games) {
  console.log('🗑️ Удаляем все игры...')
  
  let deletedCount = 0
  let errorCount = 0
  
  games.forEach((game, index) => {
    setTimeout(() => {
      deleteGame(game.id, () => {
        deletedCount++
        console.log(`✅ Удалена игра ${index + 1}/${games.length}: ${game.id}`)
        
        if (deletedCount + errorCount === games.length) {
          console.log(`\n🎯 Результат очистки:`)
          console.log(`✅ Удалено: ${deletedCount}`)
          console.log(`❌ Ошибок: ${errorCount}`)
          process.exit(0)
        }
      })
    }, index * 100) // Небольшая задержка между запросами
  })
}

// Удаляем одну игру
function deleteGame(gameId, callback) {
  const deleteData = JSON.stringify({
    gameId: gameId
  })

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/games/${gameId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(deleteData)
    }
  }

  const req = http.request(options, (res) => {
    if (res.statusCode === 200 || res.statusCode === 404) {
      callback()
    } else {
      console.error(`❌ Ошибка удаления игры ${gameId}: ${res.statusCode}`)
      callback()
    }
  })

  req.on('error', (err) => {
    console.error(`❌ Ошибка запроса для игры ${gameId}:`, err.message)
    callback()
  })

  req.write(deleteData)
  req.end()
}

// Запускаем очистку
cleanupGames() 