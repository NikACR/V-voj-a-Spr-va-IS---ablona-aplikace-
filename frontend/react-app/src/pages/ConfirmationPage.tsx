import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  paidAmount: number;
  earnedPoints: number;
  currentPoints: number;
  prepTime: number;
  discountAmount: number;
}

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const state = useLocation().state as LocationState | undefined;

  if (!state) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Neplatná stránka</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Domů
        </button>
      </div>
    );
  }

  const { paidAmount, earnedPoints, currentPoints, prepTime, discountAmount } = state;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Děkujeme za objednávku!</h2>
      <p className="mb-2">
        Zaplatili jste: <strong>{paidAmount.toFixed(2)} Kč</strong>
      </p>
      {discountAmount > 0 && (
        <p className="mb-2 text-green-600">
          Sleva uplatněná: <strong>{discountAmount} Kč</strong>
        </p>
      )}
      <p className="mb-2">
        Objednávka bude hotová za: <strong>{prepTime} minut</strong>
      </p>
      <p className="mb-2">
        Body získané nyní: <strong>{earnedPoints}</strong>
      </p>
      <p className="mb-4">
        Celkem bodů: <strong>{currentPoints}</strong>
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Domů
      </button>
    </div>
  );
};

export default ConfirmationPage;
