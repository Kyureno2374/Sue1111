# Баги и улучшения для Tic-Tac-Toe Platform

## Критические ошибки

### 1. Аутентификация
- **Ошибка**: При логине выдает "User already registered"
- **Причина**: Конфликт между двумя системами аутентификации (Supabase Auth и кастомный API)
- **Решение**:
  ```javascript
  // В components/login-screen.tsx:
  // Разделить логику для email+password и username+password
  // Если пользователь вводит email, использовать Supabase Auth
  // Если только username, использовать кастомный API
  // Не пытаться зарегистрировать пользователя, который уже существует
  ```

### 2. Игровая логика
- **Ошибка**: Игра начинается и играется, но не создается в БД, не отображается в админке
- **Причина**: Неправильная обработка создания игры в API, отсутствие транзакции
- **Решение**:
  ```javascript
  // В app/api/games/route.ts:
  // 1. Проверить, что все поля для создания игры передаются корректно
  // 2. Добавить обработку ошибок при создании игры
  // 3. Убедиться, что игра создается в БД до начала игрового процесса
  ```

### 3. Баланс пользователя
- **Ошибка**: Баланс после игры обновляется на полсекунды, затем возвращается к прежнему значению
- **Причина**: Обновление UI происходит до фактического обновления в БД, или обновление в БД не завершается успешно
- **Решение**:
  ```javascript
  // В lib/db-actions.ts:
  // 1. Убедиться, что updateUserBalance возвращает успешный результат
  // 2. Добавить проверку на успешность операции
  // 3. Обновлять UI только после подтверждения обновления в БД
  ```

### 4. Лидерборд
- **Ошибка**: После игры информация не вносится в лидерборд
- **Причина**: Отсутствие обновления статистики после завершения игры
- **Решение**:
  ```javascript
  // В app/api/games/[id]/move/route.ts:
  // После определения победителя и начисления выигрыша
  // добавить обновление статистики для лидерборда
  ```

## Функциональные улучшения

### 1. Улучшение обработки ошибок
- Добавить глобальный обработчик ошибок
- Логировать ошибки для дальнейшего анализа
- Показывать пользователю понятные сообщения об ошибках

### 2. Оптимизация работы с Supabase
- Использовать кэширование для часто запрашиваемых данных
- Оптимизировать запросы, особенно в админке
- Использовать транзакции для критических операций

### 3. Улучшение UX
- Добавить индикаторы загрузки при выполнении операций
- Улучшить отзывчивость интерфейса
- Добавить подтверждения для критических действий

## Технический долг

### 1. Рефакторинг кода
- Унифицировать обработку ошибок
- Вынести повторяющуюся логику в отдельные функции
- Улучшить типизацию данных

### 2. Тестирование
- Добавить unit-тесты для критических функций
- Добавить интеграционные тесты для API
- Добавить e2e тесты для основных пользовательских сценариев

### 3. Документация
- Дополнить документацию примерами API-запросов
- Добавить диаграммы потоков данных
- Создать руководство по развертыванию

## План исправления критических ошибок

### Шаг 1: Исправление аутентификации
```javascript
// components/login-screen.tsx
// Разделить логику для email и username авторизации
const handleLogin = async () => {
  try {
    // Если указан email, используем Supabase Auth
    if (email) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Если ошибка "User not found", пробуем зарегистрировать
        if (error.message.includes("User not found")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          // Успешная регистрация
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
            
          setUser(userData);
        } else {
          throw error;
        }
      } else {
        // Успешный вход через Supabase
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();
          
        setUser(userData);
      }
    } 
    // Если указан только username, используем кастомный API
    else if (username) {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, action: "login" }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      
      const userData = await response.json();
      setUser(userData);
    }
  } catch (error) {
    setError(error.message);
  }
};
```

### Шаг 2: Исправление создания игры
```javascript
// app/api/games/route.ts
export async function POST(request: Request) {
  try {
    const { playerX, betAmount } = await request.json();
    
    // Проверка баланса перед созданием игры
    const user = await getUserById(playerX);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    
    // Проверка достаточности баланса
    if (user.balance < betAmount) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
    }
    
    // Списание ставки
    const balanceUpdated = await updateUserBalance(playerX, -betAmount);
    if (!balanceUpdated) {
      return new Response(JSON.stringify({ error: "Failed to update balance" }), { status: 500 });
    }
    
    // Создание игры с полными данными
    const game = await createGame({
      playerX,
      playerO: null,
      betAmount,
      pot: betAmount,
      status: "waiting",
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      created_at: new Date().toISOString(),
    });
    
    if (!game) {
      // Если игра не создалась, возвращаем ставку
      await updateUserBalance(playerX, betAmount);
      return new Response(JSON.stringify({ error: "Failed to create game" }), { status: 500 });
    }
    
    // Создание транзакции для ставки
    await createTransaction({
      userId: playerX,
      amount: -betAmount,
      type: "bet",
      status: "completed",
      gameId: game.id,
    });
    
    return new Response(JSON.stringify(game), { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
```

### Шаг 3: Исправление обновления баланса
```javascript
// lib/db-actions.ts
export async function updateUserBalance(userId: string, amount: number): Promise<boolean> {
  try {
    // Получаем текущий баланс
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();
      
    if (userError || !userData) {
      console.error("Error fetching user balance:", userError);
      return false;
    }
    
    const newBalance = userData.balance + amount;
    
    // Проверка на отрицательный баланс
    if (newBalance < 0) {
      console.error("Negative balance not allowed");
      return false;
    }
    
    // Обновление баланса с возвратом обновленных данных
    const { data, error } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", userId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating balance:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in updateUserBalance:", error);
    return false;
  }
}
```

### Шаг 4: Исправление обновления лидерборда
```javascript
// app/api/games/[id]/move/route.ts
// После определения победителя:
if (winner) {
  // Обновление статистики для лидерборда
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("games_won, games_played, total_winnings")
    .eq("id", winner)
    .single();
    
  if (!userError && userData) {
    await supabase
      .from("users")
      .update({
        games_won: userData.games_won + 1,
        games_played: userData.games_played + 1,
        total_winnings: userData.total_winnings + winAmount
      })
      .eq("id", winner);
  }
  
  // Обновление статистики для проигравшего
  const loserId = winner === playerXId ? playerOId : playerXId;
  const { data: loserData, error: loserError } = await supabase
    .from("users")
    .select("games_played")
    .eq("id", loserId)
    .single();
    
  if (!loserError && loserData) {
    await supabase
      .from("users")
      .update({
        games_played: loserData.games_played + 1
      })
      .eq("id", loserId);
  }
}
```

## Дополнительные рекомендации

1. **Логирование**: Добавить подробное логирование всех критических операций для упрощения отладки.
2. **Мониторинг**: Внедрить мониторинг производительности и ошибок.
3. **Кэширование**: Использовать кэширование для часто запрашиваемых данных (лидерборд, настройки).
4. **Оптимизация запросов**: Пересмотреть запросы к БД для уменьшения нагрузки.
5. **Валидация данных**: Усилить валидацию входных данных на всех API-эндпоинтах. 