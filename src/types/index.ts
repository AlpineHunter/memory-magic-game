// src/types/index.ts

/**
 * カードの状態を表す型
 * @property id - カードの一意の識別子
 * @property value - カードの値（例：'A', '2', '3'など）
 * @property isFlipped - カードが裏返されているかどうか
 * @property isMatched - カードがマッチしているかどうか
 */
export type CardState = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

/**
 * プレイヤーを表す型
 * 'player'はユーザー、'cpu'はコンピューター操作のプレイヤーを表す
 */
export type Player = 'player' | 'cpu';

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
 * ゲーム内で発生する可能性のあるすべてのアクションを表す型
 */
export type GameAction =
  | { type: 'FLIP_CARD'; index: number }
  | { type: 'MATCH_CARDS'; indices: [number, number] }
  | { type: 'NEXT_TURN' }
  | { type: 'RESET_GAME' };

/**
 * 勝者情報の型を共通化
 */
export type WinnerInfo = {
  message: string;
  color: string;
} | null;
