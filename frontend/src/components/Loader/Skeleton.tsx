import React from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  variant = 'rect',
  className = '',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      style={style}
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
    />
  );
};
