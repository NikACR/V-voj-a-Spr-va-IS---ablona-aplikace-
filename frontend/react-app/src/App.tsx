import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import PrivateRoute from './components/PrivateRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import MyReservationsPage from './pages/MyReservationsPage'
import NewReservationPage from './pages/NewReservationPage'
import AkcePage from './pages/AkcePage'
import WorkshopsPage from './pages/WorkshopsPage'   // ← import nové stránky
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import UsersPage from './pages/UsersPage'
import NotFoundPage from './pages/NotFoundPage'

import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { LoyaltyProvider } from './contexts/LoyaltyContext'
import { NotificationsProvider } from './contexts/NotificationsContext'

const App: React.FC = () => (
  <AuthProvider>
    <CartProvider>
      <LoyaltyProvider>
        <NotificationsProvider>
          <NavBar />
          <Routes>
            {/* veřejné */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* přihlášení */}
            <Route element={<PrivateRoute />}>
              <Route path="/menu" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reservations" element={<MyReservationsPage />} />
              <Route path="/new-reservation" element={<NewReservationPage />} />
              <Route path="/events" element={<AkcePage />} />
              <Route path="/workshops" element={<WorkshopsPage />} />  {/* nová trasa */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
            </Route>

            {/* staff */}
            <Route element={<PrivateRoute requireStaff />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationsProvider>
      </LoyaltyProvider>
    </CartProvider>
  </AuthProvider>
)

export default App
