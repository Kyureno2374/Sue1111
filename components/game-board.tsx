"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { GameState, UserData } from "@/lib/types"

interface GameBoardProps {
  gameState: GameState
  onMakeMove: (index: number) => void
  onEndGame: () => void
  userData: UserData | null
  isMultiplayer?: boolean
  isAIThinking?: boolean
}

export default function GameBoard({
  gameState,
  onMakeMove,
  onEndGame,
  userData,
  isMultiplayer = false,
  isAIThinking = false,
}: GameBoardProps) {
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [lastMove, setLastMove] = useState<number | null>(null)
  const [boardHighlight, setBoardHighlight] = useState<number[]>([])

  // Определяем, какой символ использует текущий игрок (X или O)
  const playerSymbol = userData ? (gameState.players.X.id === userData.id ? "X" : "O") : "X"
  const isPlayerTurn = gameState.currentPlayer === playerSymbol

  // Добавляем логирование для отладки
  console.log("🎮 GameBoard Debug:", {
    userDataId: userData?.id,
    playersX: gameState.players.X?.id,
    playersO: gameState.players.O?.id,
    playerSymbol,
    currentPlayer: gameState.currentPlayer,
    isPlayerTurn,
    gameStatePlayers: gameState.players
  })

  // Таймер для ходов
  useEffect(() => {
    console.log(`GameBoard: gameState.status = ${gameState.status}, isPlayerTurn = ${isPlayerTurn}`);
    
    if (gameState.status === "playing" && isPlayerTurn) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // В многопользовательском режиме не делаем автоматический ход
            if (!isMultiplayer) {
              // Автоматический выбор случайной пустой ячейки, если время истекло
              const emptyIndices = gameState.board
                .map((cell, idx) => (cell === null ? idx : null))
                .filter((idx) => idx !== null) as number[]

              if (emptyIndices.length > 0) {
                const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
                onMakeMove(randomIndex)
              }
            }
            return 15
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }

    if (gameState.status !== "playing") {
      console.log(`GameBoard: Game ended with status ${gameState.status}, winner: ${gameState.winner}`);
      
      // Проверка на выигрышную линию
      const winningLine = getWinningLine(gameState.board)
      if (winningLine) {
        setBoardHighlight(winningLine)
      }

      setTimeout(() => {
        console.log(`GameBoard: Showing results modal`);
        setShowResults(true)
      }, 1000)
    }

    return () => {}
  }, [gameState.status, gameState.currentPlayer, gameState.board, onMakeMove, isPlayerTurn, isMultiplayer])

  // Сбрасываем таймер, когда наступает ход игрока
  useEffect(() => {
    if (isPlayerTurn) {
      setTimeLeft(15)
    }
  }, [isPlayerTurn])

  const handleCellClick = (index: number) => {
    console.log("🎯 Cell clicked:", { 
      index, 
      isPlayerTurn, 
      status: gameState.status, 
      cellValue: gameState.board[index],
      currentPlayer: gameState.currentPlayer,
      playerSymbol
    })
    
    if (isPlayerTurn && gameState.status === "playing" && gameState.board[index] === null) {
      console.log("🎯 Making move at position:", index)
      setLastMove(index)
      onMakeMove(index)
    } else {
      console.log("🎯 Cannot make move:", { 
        isPlayerTurn, 
        status: gameState.status, 
        cellValue: gameState.board[index] 
      })
    }
  }

  // Оптимизация анимаций для мобильных устройств
  // Добавить плавные анимации для улучшения UX, но с учетом производительности
  const renderCell = (index: number) => {
    const value = gameState.board[index]
    const isLastMove = lastMove === index
    const isHighlighted = boardHighlight.includes(index)

    return (
      <button
        key={index}
        className={`game-board-cell min-h-[60px] touch-manipulation
        ${value === "X" ? "game-board-cell-x" : value === "O" ? "game-board-cell-o" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
        ${isLastMove ? "ring-4 ring-primary/20 animate-pulse" : ""}
        ${isHighlighted ? "bg-primary/10 dark:bg-primary/20" : ""}
        ${!isPlayerTurn || gameState.status !== "playing" || value !== null ? "cursor-not-allowed" : ""}
        transition-all duration-300 ease-in-out`}
        onClick={() => handleCellClick(index)}
        disabled={!isPlayerTurn || gameState.status !== "playing" || value !== null}
      >
        {value === "X" && (
          <span
            className="text-4xl md:text-5xl transform transition-transform duration-300 ease-in-out"
            style={{ animation: isLastMove ? "scale 0.3s ease-in-out" : "none" }}
          >
            X
          </span>
        )}
        {value === "O" && (
          <span
            className="text-4xl md:text-5xl transform transition-transform duration-300 ease-in-out"
            style={{ animation: isLastMove ? "scale 0.3s ease-in-out" : "none" }}
          >
            O
          </span>
        )}
      </button>
    )
  }

  // Оптимизация рендеринга игровой доски
  // Мемоизация ячеек доски для предотвращения ненужных ререндеров
  const boardCells = useMemo(() => {
    return gameState.board.map((_, index) => renderCell(index))
  }, [gameState.board, lastMove, boardHighlight, isPlayerTurn, gameState.status])

  // Определяем, выиграл ли текущий игрок
  const didPlayerWin = gameState.winner === playerSymbol

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 p-4 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-gray-500" onClick={onEndGame}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Game #{gameState.id.slice(-5)}</h1>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>

        {/* Game Info */}
        <div className="mt-4 rounded-xl bg-white p-3 shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Bet Per Move</div>
              <div className="font-bold text-primary">${gameState.betAmount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current Pot</div>
              <div className="font-bold text-primary">${gameState.pot}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Potential Win</div>
              <div className="font-bold text-primary">${gameState.pot.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Game Status */}
        <div className="mb-6 text-center">
          {gameState.status === "playing" && (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
              </h2>
              {isAIThinking && !isPlayerTurn && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  enemy thinks...
                </div>
              )}
            </div>
          )}
          {gameState.status === "completed" && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {didPlayerWin ? "You Won!" : "You Lost!"}
            </h2>
          )}
          {gameState.status === "draw" && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">It's a Draw!</h2>
          )}
        </div>

        {/* Board */}
        <div className="grid w-full max-w-xs sm:max-w-sm grid-cols-3 gap-2 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
          {boardCells}
        </div>

        {/* Players */}
        <div className="mt-8 flex w-full max-w-xs justify-between">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
              X
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{gameState.players.X.username}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {gameState.players.X.id === userData?.id ? "You" : "Opponent"}
            </div>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
              O
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{gameState.players.O?.username || "Opponent"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {gameState.players.O?.id === userData?.id ? "You" : "Opponent"}
            </div>
          </div>
        </div>
      </main>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-0 shadow-2xl animate-fade-in dark:bg-gray-800">
            <div
              className={`p-4 text-white ${
                didPlayerWin
                  ? "bg-gradient-to-r from-primary to-primary/80"
                  : gameState.status === "draw"
                    ? "bg-gray-700"
                    : "bg-gray-900"
              }`}
            >
              <h3 className="text-lg font-semibold">
                {didPlayerWin ? "You Won!" : gameState.status === "draw" ? "It's a Draw!" : "You Lost!"}
              </h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                {didPlayerWin && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Congratulations! You won ${(gameState.betAmount * 2).toFixed(2)} (2x your bet).
                  </p>
                )}

                {gameState.status === "draw" && (
                  <p className="text-gray-600 dark:text-gray-300">
                    The game ended in a draw. Your bets have been returned.
                  </p>
                )}

                {gameState.winner && !didPlayerWin && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Better luck next time! You lost $
                    {gameState.betAmount * Math.ceil(gameState.board.filter((cell) => cell).length / 2)}.
                  </p>
                )}
              </div>

              <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Your Bet</div>
                    <div className="font-bold text-primary">${gameState.betAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Your Balance</div>
                    <div className="font-bold text-primary">${userData?.balance.toFixed(2) || "0.00"}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={onEndGame}
                >
                  Back to Home
                </Button>
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    setShowResults(false)
                    onEndGame()
                  }}
                >
                  Play Again
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Вспомогательная функция для получения выигрышной линии
function getWinningLine(board: (string | null)[]): number[] {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c]
    }
  }

  return []
}
