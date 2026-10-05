import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atelier — はじめてのデジタルイラスト',
  description: '描いて、考えて、少しずつ身につける。初心者のためのイラスト練習室。',
  applicationName: 'Atelier',
  themeColor: '#f7f5f1',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
