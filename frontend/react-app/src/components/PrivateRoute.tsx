import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
  allowRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Načítám…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && !allowRoles.some(r => user.roles?.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
