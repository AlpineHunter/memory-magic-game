import React from 'react';
import type { CardState } from '@/types';

interface CardProps {
  card: CardState;
  onClick: (id: number) => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    // カードのメインコンテナ
    // アスペクト比1:1で、レスポンシブな幅設定
    // ホバー時の拡大アニメーションと影効果付き
    <div
      className={`card aspect-square w-[calc(23vw-1rem)] sm:w-[calc(23vw-1.5rem)] md:w-[calc(23vw-2rem)] 
        max-w-[3.5rem] sm:max-w-[4.5rem] md:max-w-[6.5rem] lg:max-w-[8.5rem] 
        flex items-center justify-center text-white cursor-pointer 
        rounded-md sm:rounded-lg shadow-md sm:shadow-lg transition-all duration-300 transform hover:scale-105
        ${
          // カードが裏返された状態の場合は緑色の背景と180度回転
          // 表向きの場合は青からインディゴへのグラデーション背景
          card.isFlipped
            ? 'bg-green-500 rotate-y-180'
            : 'bg-gradient-to-br from-blue-400 to-indigo-600'
        }
        ${card.isMatched ? 'bg-green-500' : ''}`}
      onClick={() => onClick(card.id)}
    >
      {/* カードが裏返されているか、マッチした時に表示される数字 */}
      <span
        className={`text-xs sm:text-sm md:text-base lg:text-xl font-bold ${
          card.isFlipped || card.isMatched ? '' : 'hidden'
        }`}
      >
        {card.value}
      </span>
      {/* カードが表向きの時に表示される「?」マーク */}
      <span
        className={`text-xs sm:text-sm md:text-base lg:text-xl font-bold ${
          card.isFlipped || card.isMatched ? 'hidden' : ''
        }`}
      >
        ?
      </span>
    </div>
  );
};

export default Card;
