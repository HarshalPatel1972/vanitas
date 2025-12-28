import type { Metadata } from 'next';
import { Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
});

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains'
});

export const metadata: Metadata = {
  title: 'VANITAS',
  description: 'News is not infinite.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
