import React from 'react';
import type { GameState } from '@/types';

interface ScoreBoardProps {
  gameState: GameState;
  winnerInfo: { message: string; color: string } | null;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ gameState, winnerInfo }) => {
  return (
    // メインのスコアボードコンテナ
    <div className='scores mb-6 p-4 bg-white rounded-lg shadow-md'>
      {/* スコア表示グリッド */}
      <div className='grid grid-cols-2 gap-4 text-center'>
        {/* プレイヤーのスコア表示部分 */}
        <div className='p-2 bg-indigo-100 rounded'>
          <p className='font-semibold text-indigo-800'>あなた</p>
          <p className='text-2xl font-bold text-indigo-600'>
            {gameState.playerScore}
          </p>
        </div>
        {/* CPUのスコア表示部分 */}
        <div className='p-2 bg-pink-100 rounded'>
          <p className='font-semibold text-pink-800'>CPU</p>
          <p className='text-2xl font-bold text-pink-600'>
            {gameState.cpuScore}
          </p>
        </div>
      </div>
      {/* 勝者情報または現在のターン表示 */}
      <p className='mt-4 text-center text-lg font-medium text-gray-700'>
        {winnerInfo ? (
          <span className={`font-bold ${winnerInfo.color}`}>
            {winnerInfo.message}
          </span>
        ) : (
          <>
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
          </>
        )}
      </p>
    </div>
  );
};

export default ScoreBoard;
