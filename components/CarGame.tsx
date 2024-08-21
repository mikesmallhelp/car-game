import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Car {
  x: number
  y: number
  speed: number
}

export default function CarGame() {
  const [playerCar, setPlayerCar] = useState<Car>({ x: 50, y: 80, speed: 0 })
  const [otherCars, setOtherCars] = useState<Car[]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const movePlayerCar = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setPlayerCar(prev => {
      let newSpeed = prev.speed
      let newX = prev.x
      let newY = prev.y

      switch (direction) {
        case 'up':
          newSpeed = Math.min(prev.speed + 0.5, 5)
          break
        case 'down':
          newSpeed = Math.max(prev.speed - 0.5, 0)
          break
        case 'left':
          newX = Math.max(prev.x - 2, 0)
          break
        case 'right':
          newX = Math.min(prev.x + 2, 90)
          break
      }

      newY = Math.max(Math.min(newY - newSpeed, 80), 0)

      return { x: newX, y: newY, speed: newSpeed }
    })
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return
    switch (e.key) {
      case 'ArrowUp':
        movePlayerCar('up')
        break
      case 'ArrowDown':
        movePlayerCar('down')
        break
      case 'ArrowLeft':
        movePlayerCar('left')
        break
      case 'ArrowRight':
        movePlayerCar('right')
        break
    }
  }, [movePlayerCar, gameOver])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (gameOver) return

    const gameLoop = setInterval(() => {
      setOtherCars(prev => {
        const newCars = prev.map(car => ({
          ...car,
          y: car.y + car.speed
        })).filter(car => car.y < 100)

        if (Math.random() < 0.05) {
          newCars.push({
            x: Math.random() * 90,
            y: -10,
            speed: Math.random() * 2 + 1
          })
        }

        return newCars
      })

      setScore(prev => prev + 1)

      // Collision detection
      setOtherCars(prev => {
        const collided = prev.some(car => 
          Math.abs(car.x - playerCar.x) < 10 && Math.abs(car.y - playerCar.y) < 10
        )
        if (collided) {
          setGameOver(true)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(gameLoop)
  }, [playerCar, gameOver])

  const restartGame = () => {
    setPlayerCar({ x: 50, y: 80, speed: 0 })
    setOtherCars([])
    setScore(0)
    setGameOver(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
          {!gameOver && (
            <>
              <div 
                className="absolute w-10 h-16 bg-blue-500" 
                style={{ left: `${playerCar.x}%`, bottom: `${playerCar.y}%` }}
              />
              {otherCars.map((car, index) => (
                <div 
                  key={index} 
                  className="absolute w-10 h-16 bg-red-500" 
                  style={{ left: `${car.x}%`, top: `${car.y}%` }}
                />
              ))}
            </>
          )}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Peli päättyi!</h2>
                <p className="mb-4">Pisteesi: {score}</p>
                <Button onClick={restartGame}>Pelaa uudelleen</Button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xl font-bold">Pisteet: {score}</p>
          <p className="text-sm mt-2">Käytä nuolinäppäimiä ohjataksesi autoa</p>
        </div>
      </CardContent>
    </Card>
  )
}