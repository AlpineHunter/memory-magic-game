'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { CardState, GameState } from '@/types';

const GameBoard: React.FC = () => {
  // ゲームの状態を管理するステート
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // カードをシャッフルする関数
  const shuffleCards = (cards: CardState[]): CardState[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ゲームを初期化する関数
  const initializeGame = useCallback((): GameState => {
    console.log('ゲームを初期化中...');
    const values = Array(8)
      .fill(0)
      .map((_, i) => i + 1);
    const doubledValues = [...values, ...values];
    const initialCards: CardState[] = doubledValues.map((value, index) => ({
      id: index,
      value: `${value}`,
      isFlipped: false,
      isMatched: false,
    }));
    console.log('ゲームの初期化が完了しました。');
    return {
      cards: shuffleCards(initialCards),
      currentPlayer: 'player',
      playerScore: 0,
      cpuScore: 0,
    };
  }, []);

  // カードが一致するかどうかを確認する関数
  const checkForMatch = useCallback(
    (flippedCardIds: number[]) => {
      if (!gameState) return;
      const [firstId, secondId] = flippedCardIds;
      const firstCard = gameState.cards.find((card) => card.id === firstId);
      const secondCard = gameState.cards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        console.log('ペアが見つかりました！');
        setGameState((prev) => {
          if (!prev) return prev;
          const newState: GameState = {
            ...prev,
            cards: prev.cards.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            ),
            [prev.currentPlayer + 'Score']:
              (prev[
                (prev.currentPlayer + 'Score') as keyof Pick<
                  GameState,
                  'playerScore' | 'cpuScore'
                >
              ] as number) + 1,
          };
          return newState;
        });
        console.log(
          `ペアを見つけました。${
            gameState.currentPlayer === 'player' ? 'プレイヤー' : 'CPU'
          }のターンを継続します。`
        );
      } else {
        console.log('ペアが見つかりませんでした。');
        setTimeout(() => {
          setGameState((prev) => {
            if (!prev) return prev;
            const nextPlayer =
              prev.currentPlayer === 'player' ? 'cpu' : 'player';
            return {
              ...prev,
              cards: prev.cards.map((card) =>
                card.id === firstId || card.id === secondId
                  ? { ...card, isFlipped: false }
                  : card
              ),
              currentPlayer: nextPlayer,
            };
          });
        }, 1000);
      }

      setFlippedCards([]);
      setIsChecking(false);
    },
    [gameState]
  );

  // カードをめくる関数
  const flipCard = useCallback(
    (id: number) => {
      if (!gameState) return;
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === id ? { ...card, isFlipped: true } : card
          ),
        };
      });
      setFlippedCards((prev) => [...prev, id]);
    },
    [gameState]
  );

  // カードがクリックされたときの処理
  const handleCardClick = useCallback(
    (id: number) => {
      // すでに2枚のカードが引かれている場合、またはチェック中の場合はクリックを無効にする
      if (
        !gameState ||
        gameState.currentPlayer !== 'player' ||
        isChecking ||
        flippedCards.length >= 2
      )
        return;

      const clickedCard = gameState.cards.find((card) => card.id === id);
      if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched)
        return;

      flipCard(id);
      console.log(`プレイヤーが${clickedCard.value}をめくりました。`);

      if (flippedCards.length === 1) {
        setIsChecking(true);
        setTimeout(() => {
          checkForMatch([flippedCards[0], id]);
        }, 1000);
      }
    },
    [gameState, isChecking, flippedCards, flipCard, checkForMatch]
  );

  // CPUのターンを処理する関数
  const handleCpuTurn = useCallback(() => {
    if (!gameState) return;
    console.log('CPUのターンが開始されました');
    const unflippedCards = gameState.cards.filter(
      (card) => !card.isFlipped && !card.isMatched
    );
    if (unflippedCards.length < 2) return;

    const firstCard =
      unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
    flipCard(firstCard.id);
    console.log(`CPUが${firstCard.value}をめくりました。`);

    setTimeout(() => {
      const remainingCards = unflippedCards.filter(
        (card) => card.id !== firstCard.id
      );
      if (remainingCards.length > 0) {
        const secondCard =
          remainingCards[Math.floor(Math.random() * remainingCards.length)];
        flipCard(secondCard.id);
        console.log(`CPUが${secondCard.value}をめくりました。`);
        setIsChecking(true);
        setTimeout(() => {
          checkForMatch([firstCard.id, secondCard.id]);
        }, 1000);
      }
    }, 1000);
  }, [gameState, flipCard, checkForMatch]);

  // コンポーネントの初回レンダリング時にゲームを初期化
  useEffect(() => {
    setGameState(initializeGame());
  }, [initializeGame]);

  // ゲームの状態が変わったときにCPUのターンを処理
  useEffect(() => {
    if (gameState && gameState.currentPlayer === 'cpu' && !isChecking) {
      const timer = setTimeout(() => {
        handleCpuTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isChecking, handleCpuTurn]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='game-board w-full max-w-4xl mx-auto p-4'>
        <div className='w-full flex justify-center items-center mb-6'>
          <div className='relative group'>
            {/* バックグラウンドエフェクト */}
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-xl rounded-xl opacity-75 group-hover:opacity-100 transition duration-1000'></div>

            {/* メインコンテナ */}
            <div className='relative px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl'>
              <div className='flex flex-col items-center space-y-1'>
                {/* メインタイトル */}
                <div className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  Memory Card Game
                </div>

                {/* 日本語タイトル */}
                <div className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-widest bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent'>
                  メモリーカードゲーム
                </div>

                {/* 装飾的なカード要素 */}
                <div className='absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-10 border-2 border-indigo-500/30 rounded-md transform -rotate-12'></div>
                <div className='absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 border-2 border-purple-500/30 rounded-md transform rotate-12'></div>

                {/* 下部のアクセントライン */}
                <div className='absolute bottom-2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent'></div>
              </div>
            </div>
          </div>
        </div>

        {/* スコア表示 */}
        <div className='scores mb-6 p-4 bg-white rounded-lg shadow-md'>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div className='p-2 bg-indigo-100 rounded'>
              <p className='font-semibold text-indigo-800'>あなた</p>
              <p className='text-2xl font-bold text-indigo-600'>
                {gameState.playerScore}
              </p>
            </div>
            <div className='p-2 bg-pink-100 rounded'>
              <p className='font-semibold text-pink-800'>CPU</p>
              <p className='text-2xl font-bold text-pink-600'>
                {gameState.cpuScore}
              </p>
            </div>
          </div>
          <p className='mt-4 text-center text-lg font-medium text-gray-700'>
            現在のターン:
            <span
              className={`font-bold ${
                gameState.currentPlayer === 'player'
                  ? 'text-indigo-600'
                  : 'text-pink-600'
              }`}
            >
              {gameState.currentPlayer === 'player' ? 'プレイヤー' : 'CPU'}
            </span>
          </p>
        </div>

        {/* カードグリッド */}
        <div className='grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full justify-items-center'>
          {gameState.cards.map((card) => (
            <div
              key={card.id}
              className={`card aspect-square w-[calc(23vw-1rem)] sm:w-[calc(23vw-1.5rem)] md:w-[calc(23vw-2rem)] 
                 max-w-[3.5rem] sm:max-w-[4.5rem] md:max-w-[6.5rem] lg:max-w-[8.5rem] 
                 flex items-center justify-center text-white cursor-pointer 
                 rounded-md sm:rounded-lg shadow-md sm:shadow-lg transition-all duration-300 transform hover:scale-105
                 ${
                   card.isFlipped
                     ? 'bg-green-500 rotate-y-180'
                     : 'bg-gradient-to-br from-blue-400 to-indigo-600'
                 }
                 ${card.isMatched ? 'bg-green-500' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <span
                className={`text-xs sm:text-sm md:text-base lg:text-xl font-bold
                    ${card.isFlipped || card.isMatched ? '' : 'hidden'}`}
              >
                {card.value}
              </span>
              <span
                className={`text-xs sm:text-sm md:text-base lg:text-xl font-bold
                    ${card.isFlipped || card.isMatched ? 'hidden' : ''}`}
              >
                ?
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
