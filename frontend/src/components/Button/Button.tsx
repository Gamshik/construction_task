import React from 'react';
import styles from './Button.module.scss';

/**
 * Свойства компонента кнопки Button.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Вариант визуального стиля кнопки */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Флаг состояния загрузки (отображает спиннер и отключает взаимодействие) */
  isLoading?: boolean;
  /** Содержимое кнопки */
  children: React.ReactNode;
}

/**
 * Презентационный компонент универсальной кнопки.
 * Поддерживает состояния загрузки, различные варианты стилей и наследует стандартные атрибуты HTML-кнопки.
 * 
 * @param props Свойства кнопки
 * @returns React-компонент кнопки
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${isLoading ? styles.loading : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}
      <span className={styles.content}>{children}</span>
    </button>
  );
};
