const http = require('http');

async function testGameHistory() {
  console.log('📊 Тестирование истории игр...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/f3c1999b-c49c-4720-aad4-6ba9c7caf8b3/games?limit=5',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ История игр получена:');
          console.log(JSON.stringify(jsonData, null, 2));
          
          if (jsonData.games && jsonData.games.length > 0) {
            console.log('\n🎮 Последние игры:');
            jsonData.games.forEach((game, index) => {
              console.log(`${index + 1}. ${game.playerO.username} vs ${game.playerX.username} - ${game.status} (${game.winner || 'no winner'})`);
            });
          }
          resolve();
        } catch (error) {
          console.error('❌ Ошибка при парсинге JSON:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка при получении истории игр:', error.message);
      reject(error);
    });

    req.end();
  });
}

testGameHistory(); 