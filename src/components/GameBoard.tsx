'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { CardState, GameState } from '@/types';
import ScoreBoard from './ScoreBoard';
import Card from './Card';

const GameBoard: React.FC = () => {
  // ゲームの状態を管理するステート
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // カードをシャッフルする関数
  const shuffleCards = (cards: CardState[]): CardState[] => {
    const shuffled = [...cards];
    // Fisher-Yatesアルゴリズムでカードをシャッフル
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ゲームを初期化する関数
  const initializeGame = useCallback((): GameState => {
    console.log('ゲームを初期化中...');
    // 1から8までの数字を2セット作成
    const values = Array(8)
      .fill(0)
      .map((_, i) => i + 1);
    const doubledValues = [...values, ...values];
    // カードの初期状態を設定
    const initialCards: CardState[] = doubledValues.map((value, index) => ({
      id: index,
      value: `${value}`,
      isFlipped: false,
      isMatched: false,
    }));
    console.log('ゲームの初期化が完了しました。');
    return {
      cards: shuffleCards(initialCards),
      currentPlayer: 'player', // プレイヤーのターンから開始
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

      // 2枚のカードが一致するか確認
      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        console.log('ペアが見つかりました！');
        setGameState((prev) => {
          if (!prev) return prev;
          const newState: GameState = {
            ...prev,
            // 一致したカードをマッチ済みに設定
            cards: prev.cards.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            ),
            // 現在のプレイヤーのスコアを増やす
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
      } else {
        console.log('ペアが見つかりませんでした。');
        setTimeout(() => {
          setGameState((prev) => {
            if (!prev) return prev;
            // ターンを次のプレイヤーに移す
            const nextPlayer =
              prev.currentPlayer === 'player' ? 'cpu' : 'player';
            return {
              ...prev,
              // 一致しなかったカードを裏返す
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

      // 状態をリセット
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
          // 指定されたカードを表向きにする
          cards: prev.cards.map((card) =>
            card.id === id ? { ...card, isFlipped: true } : card
          ),
        };
      });
      // めくられたカードのIDを保存
      setFlippedCards((prev) => [...prev, id]);
    },
    [gameState]
  );

  // カードがクリックされたときの処理
  const handleCardClick = useCallback(
    (id: number) => {
      // 判定中または2枚のカードがすでにめくられている場合はクリックを無効にする
      try {
        if (!gameState || isChecking || flippedCards.length >= 2) return;

        const clickedCard = gameState.cards.find((card) => card.id === id);
        // すでにめくられているカードやマッチ済みのカードは無視
        if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched)
          return;

        flipCard(id);
        console.log(`プレイヤーが${clickedCard.value}をめくりました。`);

        // 2枚目のカードがめくられたら一致を確認
        if (flippedCards.length === 1) {
          setIsChecking(true);
          setTimeout(() => {
            checkForMatch([flippedCards[0], id]);
          }, 1000);
        }
      } catch (error) {
        console.error('カードクリック処理でエラーが発生しました:', error);
      }
    },
    [gameState, isChecking, flippedCards, flipCard, checkForMatch]
  );

  // CPUのターンを処理する関数
  const handleCpuTurn = useCallback(() => {
    if (!gameState) return;
    console.log('CPUのターンが開始されました');
    // めくられていないカードを選択
    const unflippedCards = gameState.cards.filter(
      (card) => !card.isFlipped && !card.isMatched
    );
    if (unflippedCards.length < 2) return;

    // ランダムに1枚目のカードを選択
    const firstCard =
      unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
    flipCard(firstCard.id);
    console.log(`CPUが${firstCard.value}をめくりました。`);

    setTimeout(() => {
      // ランダムに2枚目のカードを選択
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

  // ペアがすべて成立したかを確認する関数
  const checkForGameEnd = useCallback((): {
    message: string;
    color: string;
  } | null => {
    if (!gameState) return null;

    const allMatched = gameState.cards.every((card) => card.isMatched);
    if (allMatched) {
      return gameState.playerScore > gameState.cpuScore
        ? { message: 'プレイヤーの勝利', color: 'text-indigo-600' }
        : gameState.playerScore < gameState.cpuScore
        ? { message: 'CPUの勝利', color: 'text-pink-600' }
        : { message: '引き分け', color: 'text-gray-600' };
    }
    return null;
  }, [gameState]);

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

  const winnerInfo = checkForGameEnd();

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='game-board w-full max-w-4xl mx-auto p-4'>
        <div className='w-full flex justify-center items-center mb-6'>
          <div className='relative group'>
            {/* バックグラウンドエフェクト */}
            <div
              className='absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 
              blur-xl rounded-xl opacity-75 group-hover:opacity-100 transition duration-1000'
            ></div>
          </div>
        </div>

        <ScoreBoard gameState={gameState} winnerInfo={winnerInfo} />

        <div className='grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full justify-items-center'>
          {gameState.cards.map((card) => (
            <Card key={card.id} card={card} onClick={handleCardClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
