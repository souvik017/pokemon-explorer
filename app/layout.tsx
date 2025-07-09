import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pokemon Explorer',
  description: 'Explore the world of Pokemon',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative min-h-screen backdrop-blur-sm">
          {/* Modern glassmorphism header */}
          <header className="relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
              <div className="flex justify-center items-center h-20">
                <div className="group cursor-pointer">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                    ⚡ Pokemon Explorer
                  </h1>
                  <div className="h-0.5 w-0 bg-gradient-to-r from-yellow-400 to-purple-600 transition-all duration-300 group-hover:w-full"></div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content with glassmorphism container */}
          <main className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 transition-all duration-300 hover:bg-white/15 hover:shadow-3xl">
              {children}
            </div>
          </main>

          {/* Modern footer with floating effect */}
          {/* <footer className="relative mt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:bg-white/15">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <p className="text-white/80 text-sm mb-4 sm:mb-0">
                    Built with ❤️ using Next.js and PokeAPI
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-200"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </footer> */}
        </div>

        {/* Floating particles animation */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </body>
    </html>
  );
}