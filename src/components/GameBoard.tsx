'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { CardState, GameState } from '@/types';
import ScoreBoard from './ScoreBoard';
import Card from './Card';

const GameBoard: React.FC = () => {
  // ゲームの状態を管理するステート
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  // CPUレベルのstate追加
  const [cpuLevel, setCpuLevel] = useState<1 | 2 | 3>(1);
  // CPUのメモリを追加
  const [cpuMemory, setCpuMemory] = useState<Map<string, number[]>>(new Map());

  // カードをシャッフルする関数
  const shuffleCards = (cards: CardState[]): CardState[] => {
    const shuffled = Array.from(cards);
    // Fisher-Yatesアルゴリズムでカードをシャッフル
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ゲームを初期化する関数を更新
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
        // ペアが見つかった後に即座にisCheckingをfalseに設定
        setIsChecking(false);
        setFlippedCards([]);
      } else {
        console.log('ペアが見つかりませんでした。');
        const timer = setTimeout(() => {
          if (!isGameOver) {
            // ゲームオーバーでない場合のみ状態を更新
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
          }
          setIsChecking(false);
          setFlippedCards([]);
        }, 1000);

        return () => clearTimeout(timer); // タイマーのクリーンアップ
      }
    },
    [gameState, isGameOver] // isGameOverを依存配列に追加
  );

  // カードをめくる関数を更新
  const flipCard = useCallback(
    (id: number) => {
      if (!gameState) return;
      setGameState((prev) => {
        if (!prev) return prev;
        const card = prev.cards.find((c) => c.id === id);
        // CPUメモリに記録
        if (card && prev.currentPlayer === 'player') {
          setCpuMemory((prevMemory) => {
            const newMemory = new Map(prevMemory);
            const existing = newMemory.get(card.value) || [];
            if (!existing.includes(id)) {
              newMemory.set(card.value, [...existing, id]);
            }
            return newMemory;
          });
        }
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
      try {
        if (
          !gameState ||
          isChecking ||
          flippedCards.length >= 2 ||
          gameState.currentPlayer === 'cpu' ||
          isGameOver
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
      } catch (error) {
        console.error('カードクリック処理でエラーが発生しました:', error);
      }
    },
    [gameState, isChecking, flippedCards, flipCard, checkForMatch, isGameOver]
  );

  // CPUのターン処理を更新
  const handleCpuTurn = useCallback(() => {
    if (!gameState || isGameOver) return;
    console.log('CPUのターンが開始されました');

    const unflippedCards = gameState.cards.filter(
      (card) => !card.isFlipped && !card.isMatched
    );
    if (unflippedCards.length < 2) return;

    let firstCard: CardState;
    let secondCard: CardState;

    // CPUの難易度に応じた行動を選択
    if (cpuLevel === 1 || (cpuLevel === 2 && Math.random() > 0.4)) {
      // レベル1の場合、または レベル2で40%の確率でランダム選択を行う

      // まだめくられていないカードからランダムに1枚目を選択
      firstCard =
        unflippedCards[Math.floor(Math.random() * unflippedCards.length)];

      // 1枚目を除いた残りのカードから2枚目をランダムに選択
      const remainingCards = unflippedCards.filter(
        (card) => card.id !== firstCard.id
      );
      secondCard =
        remainingCards[Math.floor(Math.random() * remainingCards.length)];
    } else {
      // レベル3、またはレベル2で60%の確率でメモリを使用した選択を行う

      let foundPair = false;
      // CPUのメモリ（過去に見たカード）を走査
      for (const entries of Array.from(cpuMemory)) {
        const [, ids] = entries; // 同じ数字のカードIDの配列

        // 記憶したカードの中から、まだマッチしておらず、めくられていないカードを抽出
        const availableIds = ids.filter(
          (id) =>
            !gameState.cards.find((card) => card.id === id)?.isMatched && // マッチしていない
            !gameState.cards.find((card) => card.id === id)?.isFlipped // めくられていない
        );

        // 使用可能なカードが2枚以上ある場合（ペアを発見）
        if (availableIds.length >= 2) {
          // 記憶したペアの1枚目を選択
          firstCard = gameState.cards.find(
            (card) => card.id === availableIds[0]
          )!;
          // 記憶したペアの2枚目を選択
          secondCard = gameState.cards.find(
            (card) => card.id === availableIds[1]
          )!;
          foundPair = true;
          break;
        }
      }

      // 記憶からペアが見つからなかった場合
      if (!foundPair) {
        // ランダム選択に切り替え
        firstCard =
          unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
        const remainingCards = unflippedCards.filter(
          (card) => card.id !== firstCard.id
        );
        secondCard =
          remainingCards[Math.floor(Math.random() * remainingCards.length)];
      }
    }

    // カードをめくる処理
    const firstTimer = setTimeout(() => {
      if (!isGameOver) {
        flipCard(firstCard.id);
        console.log(`CPUが${firstCard.value}をめくりました。`);

        const secondTimer = setTimeout(() => {
          if (!isGameOver) {
            flipCard(secondCard.id);
            console.log(`CPUが${secondCard.value}をめくりました。`);
            setIsChecking(true);

            const matchTimer = setTimeout(() => {
              if (!isGameOver) {
                checkForMatch([firstCard.id, secondCard.id]);
              }
            }, 1000);

            return () => clearTimeout(matchTimer);
          }
        }, 1000);

        return () => clearTimeout(secondTimer);
      }
    }, 500);

    return () => clearTimeout(firstTimer);
  }, [gameState, flipCard, checkForMatch, isGameOver, cpuLevel, cpuMemory]);

  // ペアがすべて成立したかを確認する関数
  const checkForGameEnd = useCallback((): {
    message: string;
    color: string;
  } | null => {
    if (!gameState) return null;

    const allMatched = gameState.cards.every((card) => card.isMatched);
    if (allMatched) {
      setIsGameOver(true);
      return gameState.playerScore > gameState.cpuScore
        ? { message: 'プレイヤーの勝利', color: 'text-indigo-600' }
        : gameState.playerScore < gameState.cpuScore
        ? { message: 'CPUの勝利', color: 'text-pink-600' }
        : { message: '引き分け', color: 'text-gray-600' };
    }
    return null;
  }, [gameState]);

  // winnerInfoのメモ化を条件分岐の前に移動
  const winnerInfo = useMemo(() => checkForGameEnd(), [checkForGameEnd]);

  // コンポーネントの初回レンダリング時にゲームを初期化
  useEffect(() => {
    setGameState(initializeGame());
  }, [initializeGame]);

  // ゲームの状態が変わったときにCPUのターンを処理
  useEffect(() => {
    if (
      gameState &&
      gameState.currentPlayer === 'cpu' &&
      !isChecking &&
      !isGameOver &&
      flippedCards.length === 0
    ) {
      const timer = setTimeout(() => {
        handleCpuTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isChecking, handleCpuTurn, isGameOver, flippedCards]);

  // レベル選択UIを更新
  const renderLevelSelector = () => (
    <div className="mb-4 flex justify-center gap-2">
      {[1, 2, 3].map((level) => (
        <button
          key={level}
          onClick={() => {
            setCpuLevel(level as 1 | 2 | 3);
            setCpuMemory(new Map()); // メモリをリセット
            setFlippedCards([]); // めくられたカードをリセット
            setIsChecking(false); // チェック状態をリセット
            setIsGameOver(false); // ゲームオーバー状態をリセット
            setGameState(initializeGame()); // ゲームを初期化
          }}
          className={`px-4 py-2 rounded ${
            cpuLevel === level
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          レベル{level}
        </button>
      ))}
    </div>
  );

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="game-board w-full max-w-4xl mx-auto p-4">
        {renderLevelSelector()}
        <div className="w-full flex justify-center items-center mb-6">
          <div className="relative group">
            {/* バックグラウンドエフェクト */}
            <div
              className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 
              blur-xl rounded-xl opacity-75 group-hover:opacity-100 transition duration-1000"
            ></div>
          </div>
        </div>

        <ScoreBoard gameState={gameState} winnerInfo={winnerInfo} />

        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full justify-items-center">
          {gameState.cards.map((card) => (
            <Card key={card.id} card={card} onClick={handleCardClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
