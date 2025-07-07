// src/components/ui/Button.tsx
import React from 'react'

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props => (
  <button
    {...props}
    className={
      `inline-block px-4 py-2 rounded-lg font-medium transition ` +
      `bg-primary text-white hover:bg-primaryDark ` +
      (props.className ?? '')
    }
  />
)
