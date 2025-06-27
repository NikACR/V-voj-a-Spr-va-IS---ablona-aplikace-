// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes('admin');

  return (
    <nav className="bg-white shadow p-4">
      <ul className="flex items-center space-x-6">
        <li>
          <Link to="/" className="text-blue-600 hover:underline">
            Domů
          </Link>
        </li>

        {user && isAdmin && (
          <li>
            <Link to="/users" className="text-blue-600 hover:underline">
              Uživatelé
            </Link>
          </li>
        )}

        {user ? (
          <>
            <li>
              <Link to="/products" className="text-blue-600 hover:underline">
                Nabídka
              </Link>
            </li>
            <li>
              <Link to="/reservations" className="text-blue-600 hover:underline">
                Rezervace
              </Link>
            </li>
            <li>
              <Link to="/reservations/new" className="text-blue-600 hover:underline">
                Nová rezervace
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-blue-600 hover:underline">
                Profil
              </Link>
            </li>
            {/* Odhlásit zatlačíme doprava */}
            <li className="ml-auto">
              <button
                onClick={logout}
                className="text-blue-600 hover:underline bg-transparent p-0"
              >
                Odhlásit
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="text-blue-600 hover:underline">
                Přihlášení
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-blue-600 hover:underline">
                Registrace
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
