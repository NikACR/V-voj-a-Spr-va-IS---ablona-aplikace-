import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';

const DISCOUNT_THRESHOLD = 400;
const DISCOUNT_AMOUNT = 200;

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const { points } = useLoyalty();

  if (loading) return <p className="text-center mt-8">Načítám…</p>;
  if (!user) return <p className="text-center mt-8 text-red-600">Nejste přihlášeni.</p>;

  const next = points >= DISCOUNT_THRESHOLD
    ? 0
    : DISCOUNT_THRESHOLD - points;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-12">
      <h1 className="text-2xl mb-4">Můj profil</h1>
      <p><strong>Jméno:</strong> {user.jmeno} {user.prijmeni}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Telefon:</strong> {user.telefon || '–'}</p>
      <hr className="my-4" />
      <p><strong>Body:</strong> {points}</p>
      {points < DISCOUNT_THRESHOLD ? (
        <p>Zbývá do slevy {next} bodů.</p>
      ) : (
        <p>Máte nárok na slevu {DISCOUNT_AMOUNT} Kč!</p>
      )}
    </div>
  );
};

export default ProfilePage;
