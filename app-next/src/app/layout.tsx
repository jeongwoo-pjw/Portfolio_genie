import type { Metadata } from 'next';
import { SceneBackground } from '@/components/background/SceneBackground';
import './globals.css';

export const metadata: Metadata = {
  title: 'Genie Music | UXUI Case Study',
  description: '지니뮤직 앱 UXUI 개선 케이스 스터디 — Park Jeong Woo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <SceneBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
