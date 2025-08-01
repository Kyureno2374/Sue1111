const http = require('http')

// Тестирование HTTP сервера
function testHttpServer() {
  console.log('🌐 Тестирование HTTP сервера...')
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    console.log('✅ HTTP сервер отвечает!')
    console.log('Статус:', res.statusCode)
    console.log('Заголовки:', res.headers)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log('✅ HTTP сервер работает корректно')
      process.exit(0)
    })
  })

  req.on('error', (err) => {
    console.error('❌ Ошибка подключения к HTTP серверу:', err.message)
    process.exit(1)
  })

  req.setTimeout(5000, () => {
    console.error('❌ Таймаут подключения к HTTP серверу')
    req.destroy()
    process.exit(1)
  })

  req.end()
}

// Запускаем тест
testHttpServer() 