"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Users } from "lucide-react"
import type { UserData } from "@/lib/types"

interface WaitingScreenProps {
  gameId: string
  betAmount: number
  userData: UserData | null
  onGameStart: (gameData: any) => void
  onCancel: () => void
}

export default function WaitingScreen({ gameId, betAmount, userData, onGameStart, onCancel }: WaitingScreenProps) {
  const [isJoiningAI, setIsJoiningAI] = useState(false)
  const [status, setStatus] = useState<'waiting' | 'joining' | 'starting'>('waiting')
  const [waitTime, setWaitTime] = useState(0)

  // Случайная задержка от 15 до 60 секунд
  const getRandomDelay = () => {
    return Math.floor(Math.random() * 45) + 15 // 15-60 секунд
  }

  // Автоматическое подключение ИИ через случайное время
  useEffect(() => {
    const delay = getRandomDelay()
    console.log(`⏰ Автоматическое подключение ИИ через ${delay} секунд`)
    
    const timer = setTimeout(() => {
      console.log('🤖 Время вышло, подключаем ИИ...')
      setStatus('joining')
      joinAI()
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [])

  // Счетчик времени ожидания
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Проверяем статус игры каждые 2 секунды
  useEffect(() => {
    const checkGameStatus = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`)
        if (response.ok) {
          const gameData = await response.json()
          if (gameData.status === 'playing') {
            setStatus('starting')
            onGameStart(gameData)
            return
          }
        }
      } catch (error) {
        console.error('Error checking game status:', error)
      }
    }

    const interval = setInterval(checkGameStatus, 2000)
    return () => clearInterval(interval)
  }, [gameId, onGameStart])

  const joinAI = async () => {
    if (!userData) {
      console.error('❌ Нет данных пользователя')
      return
    }

    console.log('🤖 Подключаем ИИ к игре:', gameId)
    setIsJoiningAI(true)
    
    try {
      const response = await fetch(`/api/games/${gameId}/join-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id
        })
      })

      console.log('📊 Статус ответа ИИ:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ AI joined the game:', result)
        setStatus('starting')
        
        // Проверяем, что у нас есть правильные данные игры
        if (result.game && result.game.id) {
          console.log('🎮 Starting game with data:', result.game)
          onGameStart(result.game)
        } else {
          console.error('❌ Invalid game data in response:', result)
          setStatus('waiting')
        }
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to join AI:', errorData)
        setStatus('waiting')
      }
    } catch (error) {
      console.error('❌ Error joining AI:', error)
      setStatus('waiting')
    } finally {
      setIsJoiningAI(false)
    }
  }

  const handleCancel = () => {
    // TODO: Удалить игру из БД
    onCancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md border-0 shadow-2xl dark:bg-gray-800">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-semibold">Waiting for Opponent</h2>
          <p className="text-blue-100">Game ID: {gameId.slice(0, 8)}...</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <Users className="h-16 w-16 text-blue-500" />
                {status === 'waiting' && (
                  <div className="absolute -right-1 -top-1">
                    <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                  </div>
                )}
                {status === 'joining' && (
                  <div className="absolute -right-1 -top-1">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="mb-2 text-lg font-semibold dark:text-white">
              {status === 'waiting' && 'Looking for opponent...'}
              {status === 'joining' && 'Connecting opponent...'}
              {status === 'starting' && 'Starting game...'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300">
              Bet amount: ${betAmount}
            </p>
          </div>

          {status === 'waiting' && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Waiting time: {formatTime(waitTime)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                An opponent will join automatically
              </p>
            </div>
          )}

          {status === 'joining' && (
            <div className="mb-6 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-500" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Opponent is joining...
              </p>
            </div>
          )}

          {status === 'starting' && (
            <div className="mb-6 text-center">
              <div className="mx-auto h-8 w-8 rounded-full bg-green-500" />
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Game starting...
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={status === 'joining' || status === 'starting'}
              className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            
            {status === 'waiting' && (
              <Button
                onClick={joinAI}
                disabled={isJoiningAI}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {isJoiningAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Join Now
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 