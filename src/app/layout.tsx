
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VANITAS - The Finite Feed',
  description: 'A digital memento mori.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Editorial+New&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
