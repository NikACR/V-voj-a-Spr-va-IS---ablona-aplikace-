// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen space-y-4">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-lg">Stránka nenalezena</p>
    <Link
      to="/"
      className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
    >
      Zpět na úvod
    </Link>
  </div>
);

export default NotFoundPage;
