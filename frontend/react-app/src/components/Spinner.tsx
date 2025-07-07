// src/components/Spinner.tsx
import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
  </div>
);

export default Spinner;
