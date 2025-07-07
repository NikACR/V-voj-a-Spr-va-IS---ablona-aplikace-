// src/components/Layout.tsx
import React from 'react'
import Navbar from './Navbar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="container mx-auto px-4 py-8">
      {/* wrapper “card” kolem každé stránky */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {children}
      </div>
    </main>
  </div>
)

export default Layout
