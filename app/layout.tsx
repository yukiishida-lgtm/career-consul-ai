import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'あなたのキャリアコンサルAI',
  description: '自己分析・キャリア相談AIアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
