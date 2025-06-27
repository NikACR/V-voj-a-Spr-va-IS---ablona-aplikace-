import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import HomePage            from './pages/HomePage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import UsersPage           from './pages/UsersPage';
import ProductsPage        from './pages/ProductsPage';
import MyReservationsPage  from './pages/MyReservationsPage';
import NewReservationPage  from './pages/NewReservationPage';
import ProfilePage         from './pages/ProfilePage';
import StaffDashboard      from './pages/StaffDashboard';
import AdminDashboard      from './pages/AdminDashboard';
import PracovniciAdminPage from './pages/PracovniciAdminPage';
import AdminRezervaceForm  from './pages/AdminRezervaceForm';
import AdminSchuzkaForm    from './pages/AdminSchuzkaForm';
import NotFoundPage        from './pages/NotFoundPage';

const App: React.FC = () => (
  <>
    <Navbar />

    <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/users"
          element={
            <PrivateRoute allowRoles={['admin']}>
              <UsersPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <PrivateRoute>
              <MyReservationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/new"
          element={
            <PrivateRoute>
              <NewReservationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/reservations/manage"
          element={
            <PrivateRoute allowRoles={['staff','admin']}>
              <StaffDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pracovnici"
          element={
            <PrivateRoute allowRoles={['admin']}>
              <PracovniciAdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/rezervace"
          element={
            <PrivateRoute allowRoles={['admin']}>
              <AdminRezervaceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/schuzky"
          element={
            <PrivateRoute allowRoles={['admin']}>
              <AdminSchuzkaForm />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  </>
);

export default App;
