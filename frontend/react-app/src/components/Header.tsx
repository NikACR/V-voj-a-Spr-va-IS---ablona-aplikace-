// src/components/Header.tsx
import React from 'react';

export function Header() {
  return (
    <header className="flex justify-between items-center border-b pb-2 mb-6 font-body">
      <img src="/logo.svg" alt="Logo" className="h-12" />
      <span className="text-sm text-gray-600">
        {new Date().toLocaleDateString()}
      </span>
    </header>
  );
}
