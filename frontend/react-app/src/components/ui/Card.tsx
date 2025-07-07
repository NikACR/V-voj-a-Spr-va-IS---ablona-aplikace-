// src/components/ui/Card.tsx
import React from 'react'

export const Card: React.FC<{ className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className || ''}`}>
    {children}
  </div>
)
