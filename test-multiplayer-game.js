const https = require('https');

const BASE_URL = 'https://sue1111.vercel.app';
const API_BASE = 'https://sue1111.vercel.app/api';

// Тестовые пользователи
const USER1 = {
  id: 'test-user-1',
  username: 'TestPlayer1',
  balance: 1000
};

const USER2 = {
  id: 'test-user-2', 
  username: 'TestPlayer2',
  balance: 1000
};

// Функция для HTTP запросов
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Тест 1: Создание игры
async function testCreateGame() {
  console.log('\n🎮 Тест 1: Создание игры');
  
  try {
    const response = await makeRequest('/games/lobby', 'POST', {
      userId: USER1.id,
      username: USER1.username,
      betAmount: 10
    });
    
    console.log('✅ Создание игры:', response);
    return response.data?.game?.id;
  } catch (error) {
    console.error('❌ Ошибка создания игры:', error);
    return null;
  }
}

// Тест 2: Присоединение к игре
async function testJoinGame(gameId) {
  console.log('\n🎮 Тест 2: Присоединение к игре');
  
  try {
    const response = await makeRequest(`/games/${gameId}/join`, 'POST', {
      userId: USER2.id,
      username: USER2.username
    });
    
    console.log('✅ Присоединение к игре:', response);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка присоединения:', error);
    return false;
  }
}

// Тест 3: Получение состояния игры
async function testGetGameState(gameId) {
  console.log('\n🎮 Тест 3: Получение состояния игры');
  
  try {
    const response = await makeRequest(`/games/${gameId}`);
    console.log('✅ Состояние игры:', response);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения состояния:', error);
    return null;
  }
}

// Тест 4: Ход первого игрока
async function testMakeMove1(gameId) {
  console.log('\n🎮 Тест 4: Ход первого игрока (позиция 4)');
  
  try {
    const response = await makeRequest(`/games/${gameId}/move`, 'POST', {
      userId: USER1.id,
      position: 4
    });
    
    console.log('✅ Ход первого игрока:', response);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка хода первого игрока:', error);
    return false;
  }
}

// Тест 5: Ход второго игрока
async function testMakeMove2(gameId) {
  console.log('\n🎮 Тест 5: Ход второго игрока (позиция 0)');
  
  try {
    const response = await makeRequest(`/games/${gameId}/move`, 'POST', {
      userId: USER2.id,
      position: 0
    });
    
    console.log('✅ Ход второго игрока:', response);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Ошибка хода второго игрока:', error);
    return false;
  }
}

// Тест 6: Проверка финального состояния
async function testFinalState(gameId) {
  console.log('\n🎮 Тест 6: Проверка финального состояния');
  
  try {
    const response = await makeRequest(`/games/${gameId}`);
    console.log('✅ Финальное состояние:', response);
    
    const gameData = response.data;
    console.log('📊 Результаты:');
    console.log('- Статус игры:', gameData.status);
    console.log('- Победитель:', gameData.winner);
    console.log('- Доска:', gameData.board);
    console.log('- Текущий игрок:', gameData.currentPlayer);
    
    return gameData;
  } catch (error) {
    console.error('❌ Ошибка получения финального состояния:', error);
    return null;
  }
}

// Тест 7: Проверка лобби
async function testLobby() {
  console.log('\n🎮 Тест 7: Проверка лобби');
  
  try {
    const response = await makeRequest('/games/lobby');
    console.log('✅ Лобби:', response);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения лобби:', error);
    return null;
  }
}

// Тест 8: Проверка пользователей
async function testUsers() {
  console.log('\n🎮 Тест 8: Проверка пользователей');
  
  try {
    const response1 = await makeRequest(`/users/${USER1.id}`);
    const response2 = await makeRequest(`/users/${USER2.id}`);
    
    console.log('✅ Пользователь 1:', response1);
    console.log('✅ Пользователь 2:', response2);
    
    return { user1: response1.data, user2: response2.data };
  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error);
    return null;
  }
}

// Основная функция тестирования
async function runAllTests() {
  console.log('🚀 Запуск комплексного тестирования мультиплеера');
  console.log('=' .repeat(60));
  
  // Тест 7: Проверка лобби
  await testLobby();
  
  // Тест 8: Проверка пользователей
  await testUsers();
  
  // Тест 1: Создание игры
  const gameId = await testCreateGame();
  
  if (!gameId) {
    console.error('❌ Не удалось создать игру, прерываем тесты');
    return;
  }
  
  // Небольшая пауза
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Тест 2: Присоединение к игре
  const joinSuccess = await testJoinGame(gameId);
  
  if (!joinSuccess) {
    console.error('❌ Не удалось присоединиться к игре, прерываем тесты');
    return;
  }
  
  // Небольшая пауза
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Тест 3: Получение состояния игры
  await testGetGameState(gameId);
  
  // Небольшая пауза
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Тест 4: Ход первого игрока
  const move1Success = await testMakeMove1(gameId);
  
  if (!move1Success) {
    console.error('❌ Не удалось сделать ход первому игроку, прерываем тесты');
    return;
  }
  
  // Небольшая пауза
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Проверяем состояние после первого хода
  await testGetGameState(gameId);
  
  // Небольшая пауза
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Тест 5: Ход второго игрока
  const move2Success = await testMakeMove2(gameId);
  
  if (!move2Success) {
    console.error('❌ Не удалось сделать ход второму игроку, прерываем тесты');
    return;
  }
  
  // Небольшая пауза
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Тест 6: Проверка финального состояния
  await testFinalState(gameId);
  
  console.log('\n🎉 Все тесты завершены!');
}

// Запуск тестов
runAllTests().catch(console.error); 