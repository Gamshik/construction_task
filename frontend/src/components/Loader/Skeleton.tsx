import React from 'react';
import styles from './Skeleton.module.scss';

/**
 * Свойства компонента Skeleton loader.
 */
interface SkeletonProps {
  /** Ширина блока заглушки (например, "100px", "50%" или числом в px) */
  width?: string | number;
  /** Высота блока заглушки (например, "20px", "2rem" или числом в px) */
  height?: string | number;
  /** Форма заглушки: текстовая строка, прямоугольник или круг */
  variant?: 'text' | 'rect' | 'circle';
  /** Дополнительный CSS-класс для тонкой настройки стилей */
  className?: string;
}

/**
 * Компонент-скелетон (заглушка) для индикации загрузки контента.
 * Используется для предотвращения резких скачков макета (layout shifts) во время ожидания данных.
 * 
 * @param props Свойства скелетона
 * @returns React-компонент Skeleton
 */
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
