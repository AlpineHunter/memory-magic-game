// src/types/index.ts

/**
 * カードの状態を表す型
 * @property value - カードの値（例：'A', '2', '3'など）
 * @property isFlipped - カードが裏返されているかどうか
 * @property isMatched - カードがマッチしているかどうか
 */
export type CardState = {
  id: number; // この行を追加
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

/**
 * ゲームの全体的な状態を表す型
 * @property cards - ゲーム内のすべてのカードの状態
 * @property currentPlayer - 現在のプレイヤー（'player'または'cpu'）
 * @property playerScore - プレイヤーのスコア
 * @property cpuScore - CPUのスコア
 */
export type GameState = {
  cards: CardState[];
  currentPlayer: Player;
  playerScore: number;
  cpuScore: number;
};

/**
 * プレイヤーを表す型
 * 'player'はユーザー、'cpu'はコンピューター操作のプレイヤーを表す
 */
export type Player = 'player' | 'cpu';

/**
 * ゲーム内で発生する可能性のあるすべてのアクションを表す型
 */
export type GameAction =
  | { type: 'FLIP_CARD'; index: number } // カードを裏返すアクション
  | { type: 'MATCH_CARDS'; indices: [number, number] } // カードをマッチさせるアクション
  | { type: 'NEXT_TURN' } // 次のターンに移るアクション
  | { type: 'RESET_GAME' }; // ゲームをリセットするアクション
