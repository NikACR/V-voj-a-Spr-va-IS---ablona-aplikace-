// src/components/SkeletonCard.tsx
import React from 'react';

interface SkeletonCardProps {
  width?: string;
  height?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = '200px',
}) => (
  <div
    className="bg-gray-200 animate-pulse rounded"
    style={{ width, height }}
  />
);

export default SkeletonCard;
