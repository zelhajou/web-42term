// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '42term | Beautiful Terminal Widgets for 42 School Students',
  description: 'Generate beautiful terminal-style widgets to showcase your 42 school achievements on GitHub and other platforms.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}