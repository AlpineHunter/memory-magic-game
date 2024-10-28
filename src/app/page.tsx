import GameBoard from '@/components/GameBoard';

/**
 * メインページコンポーネント
 * このコンポーネントはアプリケーションのルートページを表します。
 * GameBoardコンポーネントをラップし、必要に応じて追加のUI要素を提供します。
 */
export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      {/* ゲームボードコンポーネントをレンダリング */}
      <GameBoard />
    </main>
  );
}
