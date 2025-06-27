import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return <p className="text-center mt-8">Načítám…</p>
  if (!user)  return <p className="text-center mt-8 text-red-600">Nejste přihlášen.</p>

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-12">
      <h1 className="text-2xl mb-4">Můj profil</h1>
      <p><strong>Jméno:</strong> {user.jmeno} {user.prijmeni}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Telefon:</strong> {user.telefon || '–'}</p>
    </div>
  )
}

export default ProfilePage
